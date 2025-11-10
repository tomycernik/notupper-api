import { EmotionRepositorySupabase } from "@/infrastructure/repositories/emotion.repository.supabase";
import { supabase } from "@/config/supabase";

jest.mock("@/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("EmotionRepositorySupabase", () => {
  let repo: EmotionRepositorySupabase;

  beforeEach(() => {
    repo = new EmotionRepositorySupabase();
    jest.clearAllMocks();
  });

  test("findAllByName should return array of emotions when data is returned", async () => {
    const mockData = [{ emotion: "Alegría" }, { emotion: "Tristeza" }];

    const selectMock = jest.fn().mockResolvedValue({ data: mockData, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await repo.getAllByName();

    expect(result).toEqual(["Alegría", "Tristeza"]);
    expect(supabase.from).toHaveBeenCalledWith("emotion");
    expect(selectMock).toHaveBeenCalledWith("emotion");
  });

  test("findAllByName should return empty array if data is null", async () => {
    const selectMock = jest.fn().mockResolvedValue({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await repo.getAllByName();

    expect(result).toEqual([]);
  });

  test("findAllByName should throw an error if Supabase returns an error", async () => {
    const mockError = new Error("Something went wrong");
    const selectMock = jest.fn().mockResolvedValue({ data: null, error: mockError });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    await expect(repo.getAllByName()).rejects.toThrow("Error fetching emotions: Something went wrong");
  });
});
