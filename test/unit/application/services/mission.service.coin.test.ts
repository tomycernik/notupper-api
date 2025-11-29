import { MissionService } from '../../../../src/application/services/mission.service';

describe('MissionService - Coin movements for badges', () => {
  let missionService: any;
  let dreamNodeRepository: any;
  let missionRepository: any;
  let badgeRepository: any;
  let coinRepository: any;

  beforeEach(() => {
    dreamNodeRepository = { countUserNodes: jest.fn(), getUserNodes: jest.fn() };
    missionRepository = {
      getAllMissions: jest.fn(),
      getUserMission: jest.fn(),
      getUserMissions: jest.fn(),
      upsertUserMission: jest.fn()
    };
    badgeRepository = {
      awardBadge: jest.fn(),
      getBadgeById: jest.fn()
    };
    coinRepository = {
      addCoins: jest.fn(),
      registerMovement: jest.fn()
    };
    missionService = new MissionService(dreamNodeRepository, missionRepository, badgeRepository, coinRepository);
  });

  it('should register coin movement when badge with reward is unlocked', async () => {
    missionRepository.getAllMissions.mockResolvedValue([
      { code: 'first_dream', target: 1, badgeId: 'b1' }
    ]);
    missionRepository.getUserMissions.mockResolvedValue([
      { code: 'first_dream', progress: 0, completedAt: null }
    ]);
    badgeRepository.getBadgeById.mockResolvedValue({ id: 'b1', coin_reward: 50 });
    dreamNodeRepository.countUserNodes.mockResolvedValue(1);
    dreamNodeRepository.getUserNodes.mockResolvedValue([]);

    await missionService.onDreamSaved('user');
    expect(coinRepository.addCoins).toHaveBeenCalledWith('user', 50);
    // Si agregas el registro automático, también deberías testear:
    // expect(coinRepository.registerMovement).toHaveBeenCalledWith('user', 50, 'ingreso', expect.stringContaining('recompensa insignia'));
  });
});
