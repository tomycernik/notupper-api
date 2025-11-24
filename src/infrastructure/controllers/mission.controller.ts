import { IMissionRepository } from '@domain/repositories/mission.repository';
import { Request, Response } from 'express';

export class MissionController {
  constructor(private readonly missionRepository: IMissionRepository) {}

  async allMissions(req: Request, res: Response) {
    try {
      const missions = await this.missionRepository.getAllMissions();
      res.json({ missions });
    } catch (e: any) {
      console.error('MissionController allMissions error:', e);
      res.status(500).json({ errors: 'Error al obtener todas las misiones' });
    }
  }

  async myMissions(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      if (!userId) return res.status(401).json({ errors: 'Unauthorized' });

      const missions = await this.missionRepository.getUserMissions(userId);
      return res.json({ missions });
    } catch (e: any) {
      console.error('MissionController myMissions error:', e);
      return res.status(500).json({ errors: 'Error al obtener misiones' });
    }
  }
}
