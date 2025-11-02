import { IMissionRepository } from "../../../../src/domain/repositories/mission.repository";
import { Mission, UserMissionProgress } from "../../../../src/domain/models/mission.model";

describe("MissionRepository", () => {
  let repo: IMissionRepository;

  beforeEach(() => {
    repo = {
      getAllMissions: jest.fn().mockResolvedValue([
        {
          id: 1,
          code: "first_dream",
          title: "First Dream",
          description: "Desc",
          type: "counter",
          target: 1,
          badgeId: "b1"
        }
      ]),
      getUserMissions: jest.fn().mockResolvedValue([
        {
          missionId: 1,
          code: "first_dream",
          title: "First Dream",
          description: "Desc",
          type: "counter",
          target: 1,
          progress: 1,
          completedAt: null
        }
      ]),
      getUserMission: jest.fn().mockResolvedValue({
        missionId: 1,
        code: "first_dream",
        title: "First Dream",
        description: "Desc",
        type: "counter",
        target: 1,
        progress: 1,
        completedAt: null
      }),
      upsertUserMission: jest.fn().mockResolvedValue({
        missionId: 1,
        code: "first_dream",
        title: "First Dream",
        description: "Desc",
        type: "counter",
        target: 1,
        progress: 1,
        completedAt: null
      }),
    };
  });

  it("should get all missions", async () => {
  const missions = await repo.getAllMissions();
  expect(missions[0]?.code).toBe("first_dream");
  });

  it("should get user missions", async () => {
  const userMissions = await repo.getUserMissions("user");
  expect(userMissions[0]?.code).toBe("first_dream");
  });

  it("should get user mission by code", async () => {
  const userMission = await repo.getUserMission("user", "first_dream");
  expect(userMission?.code).toBe("first_dream");
  });

  it("should upsert user mission", async () => {
  const result = await repo.upsertUserMission("user", "first_dream", 1, true);
  expect(result.code).toBe("first_dream");
  });
});
