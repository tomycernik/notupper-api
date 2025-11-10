import { DreamTypeRepositorySupabase } from "@/infrastructure/repositories/dream-type.repository.supabase";
import { supabase } from "@/config/supabase";

jest.mock("@/config/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("DreamTypeRepositorySupabase", () => {
  let repo: DreamTypeRepositorySupabase;

  beforeEach(() => {
    repo = new DreamTypeRepositorySupabase();
    jest.clearAllMocks();
  });

  test("getAllDreamTypesByName should return array of dream types when data is returned", async () => {
    const mockData = [
      { dream_type: "Estandar" },
      { dream_type: "Premonitorio" },
    ];

    const selectMock = jest.fn().mockResolvedValue({ data: mockData, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await repo.getAllByName();

    expect(result).toEqual(["Estandar", "Premonitorio"]);
    expect(supabase.from).toHaveBeenCalledWith("dream_type");
    expect(selectMock).toHaveBeenCalledWith("dream_type");
  });

  test("getAllDreamTypesByName should return empty array if data is null", async () => {
    const selectMock = jest.fn().mockResolvedValue({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    const result = await repo.getAllByName();

    expect(result).toEqual([]);
  });

  test("getAllDreamTypesByName should throw an error if Supabase returns an error", async () => {
    const mockError = new Error("Database failure");
    const selectMock = jest.fn().mockResolvedValue({ data: null, error: mockError });
    (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

    await expect(repo.getAllByName()).rejects.toThrow(
      "Error fetching dream types: Database failure"
    );
  });
});
