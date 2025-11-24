import { IDreamNodeRepository } from "../../domain/repositories/dream-node.repository";
import { IBadgeRepository } from "../../domain/repositories/badge.repository";
import { IMissionRepository } from "../../domain/repositories/mission.repository";
import { Badge } from "../../domain/models/badge.model";
import { ICoinRepository } from "../../domain/repositories/coin.repository";

export class MissionService {
  constructor(
    private readonly dreamNodeRepository: IDreamNodeRepository,
    private readonly missionRepository: IMissionRepository,
    private readonly badgeRepository: IBadgeRepository,
    private readonly coinRepository: ICoinRepository
  ) {}

  async onDreamSaved(profileId: string): Promise<Badge[]> {
    const unlockedBadges: Badge[] = [];
    const totalDreams = await this.dreamNodeRepository.countUserNodes(
      profileId,
      {} as any
    );
    const previousCount = Math.max(0, totalDreams - 1);
    // Misiones por cantidad de sueños guardados
    const counterMissions = ['first_dream', 'five_dreams', 'dedicated_dreamer', 'dream_explorer', 'dream_master'];
    for (const missionCode of counterMissions) {
      const badge = await this.updateCounterMission(profileId, missionCode, totalDreams, previousCount);
      if (badge) unlockedBadges.push(badge);
    }
    //Misiones por racha de dias
    const currentStreak = await this.computeCurrentStreak(profileId);
    const previousStreak = await this.estimatePreviousStreak(profileId, currentStreak);
    const streakMissions = ['constant_dreamer', 'dream_routine', 'dream_diary'];
    for (const missionCode of streakMissions) {
      const badge = await this.updateStreakMission(profileId, missionCode, currentStreak, previousStreak);
      if (badge) unlockedBadges.push(badge);
    }
    return unlockedBadges;
  }

  private async updateCounterMission(profileId: string, missionCode: string, count: number, previousCount: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const progress = Math.min(count, mission.target);
    const completed = progress >= mission.target;

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const wasAlreadyCompleted = existing?.completedAt != null;

    //detecta si se desbloqueo la mision justo ahora, si antes no estaba completada y ahora si
    const crossedThreshold = previousCount < mission.target && count >= mission.target;

    await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    //si se completo la mision y se cruzo el umbral y antes no estaba completada
    if (completed && crossedThreshold && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      if (badge && badge.coin_reward && badge.coin_reward > 0) {
        await this.coinRepository.addCoins(profileId, badge.coin_reward);
      }
      return badge;
    }
    return null;
  }

  async onDreamReinterpreted(profileId: string): Promise<Badge[]> {
    const badge = await this.incrementalEventMission(profileId, 'reflective_interpreter', 1);
    return badge ? [badge] : [];
  }

  //sirve para misiones que avanzan por eventos (como en el caso de reinterpretar)
  private async incrementalEventMission(profileId: string, missionCode: string, delta: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const current = existing?.progress ?? 0;
    const wasAlreadyCompleted = existing?.completedAt != null;

    const next = Math.min(current + delta, mission.target);
    const completed = next >= mission.target;
    await this.missionRepository.upsertUserMission(profileId, missionCode, next, completed);

    if (completed && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      // Otorgar monedas si corresponde
      if (badge && badge.coin_reward && badge.coin_reward > 0) {
        await this.coinRepository.addCoins(profileId, badge.coin_reward);
      }
      return badge;
    }
    return null;
  }

  private async updateStreakMission(profileId: string, missionCode: string, currentStreak: number, previousStreak: number): Promise<Badge | null> {
    const missions = await this.missionRepository.getAllMissions();
    const mission = missions.find(m => m.code === missionCode);
    if (!mission || !mission.target) return null;

    const progress = Math.min(currentStreak, mission.target);
    const completed = progress >= mission.target;

    const existing = await this.missionRepository.getUserMission(profileId, missionCode);
    const wasAlreadyCompleted = existing?.completedAt != null;
    const crossedThreshold = previousStreak < mission.target && currentStreak >= mission.target;

    await this.missionRepository.upsertUserMission(profileId, missionCode, progress, completed);

    if (completed && crossedThreshold && !wasAlreadyCompleted && mission.badgeId) {
      await this.badgeRepository.awardBadge(profileId, mission.badgeId);
      const badge = await this.badgeRepository.getBadgeById(mission.badgeId);
      // Otorgar monedas si corresponde
      if (badge && badge.coin_reward && badge.coin_reward > 0) {
        await this.coinRepository.addCoins(profileId, badge.coin_reward);
      }
      return badge;
    }
    return null;
  }
  //calcula la racha antes de guardar el sueño actual (evalua si el usuario acaba de aumentar su racha o si ya tenia sueños guardados en el dia)
  private async estimatePreviousStreak(profileId: string, currentStreak: number): Promise<number> {
    const now = new Date();
    // Obtiene el inicio y el fin del día actual en UTC
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    // Filtra los sueños de hoy
    const filters = { from: start.toISOString(), to: end.toISOString() } as any;
    const dreamsToday = await this.dreamNodeRepository.countUserNodes(profileId, filters);
    const isFirstDreamToday = dreamsToday <= 1; // si hay 1 o menos sueños hoy, significa que el sueño actual es el primero del día
    //si es el primer sueño del dia, la racha anterior es la actual menos 1, sino es igual a la actual
    return isFirstDreamToday ? Math.max(0, currentStreak - 1) : currentStreak;

  }

  private async computeCurrentStreak(profileId: string): Promise<number> {

    const today = new Date();
    const lookbackDays = 60;
    const from = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - lookbackDays));
    const to = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));

    const filters = {
      from: from.toISOString(),
      to: to.toISOString(),
    } as any;

    const dreams = await this.dreamNodeRepository.getUserNodes(profileId, filters, { page: 1, limit: 1000, offset: 0 });

    /* se recorre un for 60 veces, i seria el dia recorrido,
    normaliza cada fecha teniendo en cuenta los dias
    que pasen (i) y luego verifica si esa fecha esta en el dayset*/

    const daySet = new Set<string>();
    for (const d of dreams) {

      const dt = new Date((d as any).creationDate);
      if (isNaN(dt.getTime())) continue;
      daySet.add(this.toUTCDateKey(dt));
    }

    let streak = 0;
    for (let i = 0; i < lookbackDays + 1; i++) {
      const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
      const key = this.toUTCDateKey(date);
      if (daySet.has(key)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  //normaliza la fecha a formato yyyy-mm-dd en UTC
  private toUTCDateKey(d: Date): string {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
