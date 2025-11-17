import { IBadgeRepository } from "../../../../src/domain/repositories/badge.repository";
import { Badge } from "../../../../src/domain/models/badge.model";

describe("BadgeRepository", () => {
  let repo: IBadgeRepository;

  beforeEach(() => {
    repo = {
      getUserBadges: jest.fn().mockResolvedValue([{ id: "b1" } as Badge]),
      getBadgeById: jest.fn().mockResolvedValue({ id: "b1" } as Badge),
      awardBadge: jest.fn().mockResolvedValue(undefined),
      getUserFeaturedBadges: jest.fn().mockResolvedValue([]),
      setUserFeaturedBadges: jest.fn().mockResolvedValue(undefined),
    };
  });

  it("should get user badges", async () => {
    const badges = await repo.getUserBadges("user");
    expect(badges).toEqual([{ id: "b1" }]);
  });

  it("should get badge by id", async () => {
    const badge = await repo.getBadgeById("b1");
    expect(badge).toEqual({ id: "b1" });
  });

  it("should award badge", async () => {
    await expect(repo.awardBadge("user", "b1")).resolves.toBeUndefined();
    expect(repo.awardBadge).toHaveBeenCalledWith("user", "b1");
  });
});
