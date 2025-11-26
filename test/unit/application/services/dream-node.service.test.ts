import { DreamNodeService } from "../../../../src/application/services/dream-node.service";
import { IDreamNodeRepository } from "../../../../src/domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../../../src/infrastructure/dtos/dream-node";
import { DreamContext } from "../../../../src/domain/interfaces/interpretation-dream.interface";

jest.mock("../../../../src/config/envs", () => ({
  envs: {
    SUPABASE_URL: "blockadelabs.com",
  },
}));

describe("DreamNodeService - saveDreamNode", () => {
  let service: DreamNodeService;
  let mockRepository: jest.Mocked<IDreamNodeRepository>;

  let dreamContext: DreamContext;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn().mockResolvedValue({
        data: { id: "mocked-id" },
        error: null
      }),
      getUserNodes: jest.fn(),
      countUserNodes: jest.fn(),
      addDreamContext: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<IDreamNodeRepository>;

    service = new DreamNodeService(mockRepository);
    dreamContext = {
      themes: [],
      people: [],
      locations: [],
      emotions_context: []
    };
  });

  it("should save a dreamNode correctly with valid imageUrl", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño de prueba",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "felicidad",
      imageTitle: "image1.jpg",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        interpretation: node.interpretation,
        emotion: expect.stringMatching(/felicidad/i),
        privacy: "Privado",
        state: "Activo",
        imageUrl: expect.stringContaining("image1.jpg"),
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should throw an error if the repository fails", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño con error",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "enojo",
      imageTitle: "https://mock.blockadelabs.com/storage/v1/object/public/image2.jpg",
      dreamType: "Estandar"
    };

    mockRepository.save.mockRejectedValue(new Error("Error en DB"));
    await expect(service.saveDreamNode(userId, node, dreamContext)).rejects.toThrow(
      "Error en DB"
    );
  });
});

describe("DreamNodeService - shareDream and unshareDream", () => {
  let service: DreamNodeService;
  let mockRepository: jest.Mocked<IDreamNodeRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      getUserNodes: jest.fn(),
      countUserNodes: jest.fn(),
      addDreamContext: jest.fn(),
      updateDreamNode: jest.fn(),
      getDreamsForFeed: jest.fn(),
      countPublicDreams: jest.fn(),
    } as unknown as jest.Mocked<IDreamNodeRepository>;

    service = new DreamNodeService(mockRepository);
  });

  describe("shareDream", () => {
    it("should share a dream successfully", async () => {
      const userId = "user123";
      const nodeId = "dream-id-456";
      const mockResponse = {
        data: {
          id: nodeId,
          privacy: "Publico",
        },
        error: null,
      };

      mockRepository.updateDreamNode.mockResolvedValue(mockResponse);

      const result = await service.shareDream(userId, nodeId);

      expect(mockRepository.updateDreamNode).toHaveBeenCalledWith(
        nodeId,
        userId,
        { privacy: "Publico" }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if dream not found", async () => {
      const userId = "user123";
      const nodeId = "non-existent-id";

      mockRepository.updateDreamNode.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.shareDream(userId, nodeId)).rejects.toThrow(
        "Error al compartir el sueño: No se encontró el nodo de sueño o no tienes permisos para compartirlo"
      );
    });

    it("should throw error if repository returns error", async () => {
      const userId = "user123";
      const nodeId = "dream-id-456";

      mockRepository.updateDreamNode.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.shareDream(userId, nodeId)).rejects.toThrow(
        "Error al compartir el sueño: Database error"
      );
    });
  });

  describe("unshareDream", () => {
    it("should unshare a dream successfully", async () => {
      const userId = "user123";
      const nodeId = "dream-id-456";
      const mockResponse = {
        data: {
          id: nodeId,
          privacy: "Privado",
        },
        error: null,
      };

      mockRepository.updateDreamNode.mockResolvedValue(mockResponse);

      const result = await service.unshareDream(userId, nodeId);

      expect(mockRepository.updateDreamNode).toHaveBeenCalledWith(
        nodeId,
        userId,
        { privacy: "Privado" }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if dream not found", async () => {
      const userId = "user123";
      const nodeId = "non-existent-id";

      mockRepository.updateDreamNode.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(service.unshareDream(userId, nodeId)).rejects.toThrow(
        "Error al descompartir el sueño: No se encontró el nodo de sueño o no tienes permisos para descompartirlo"
      );
    });

    it("should throw error if repository returns error", async () => {
      const userId = "user123";
      const nodeId = "dream-id-456";

      mockRepository.updateDreamNode.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(service.unshareDream(userId, nodeId)).rejects.toThrow(
        "Error al descompartir el sueño: Database error"
      );
    });
  });

  describe("getDreamsForFeed", () => {
    it("should return paginated public dreams", async () => {
      const mockPublicDreams = [
        {
          id: "dream-1",
          title: "Public Dream 1",
          privacy: "Publico",
          owner: {
            id: "user-1",
            username: "user1",
            avatar_url: "avatar1.jpg",
          },
        },
        {
          id: "dream-2",
          title: "Public Dream 2",
          privacy: "Publico",
          owner: {
            id: "user-2",
            username: "user2",
            avatar_url: "avatar2.jpg",
          },
        },
      ];

      mockRepository.getDreamsForFeed.mockResolvedValue(mockPublicDreams as any);
      mockRepository.countPublicDreams.mockResolvedValue(2);

      const result = await service.getDreamsForFeed({ page: 1, limit: 10 });

      expect(mockRepository.getDreamsForFeed).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0,
      });
      expect(mockRepository.countPublicDreams).toHaveBeenCalled();
      expect(result.data).toEqual(mockPublicDreams);
      expect(result.pagination).toEqual({
        currentPage: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle pagination correctly", async () => {
      mockRepository.getDreamsForFeed.mockResolvedValue([]);
      mockRepository.countPublicDreams.mockResolvedValue(25);

      const result = await service.getDreamsForFeed({ page: 2, limit: 10 });

      expect(mockRepository.getDreamsForFeed).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        offset: 10,
      });
      expect(result.pagination).toEqual({
        currentPage: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should use default pagination if not provided", async () => {
      mockRepository.getDreamsForFeed.mockResolvedValue([]);
      mockRepository.countPublicDreams.mockResolvedValue(0);

      await service.getDreamsForFeed();

      expect(mockRepository.getDreamsForFeed).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it("should throw error if repository fails", async () => {
      mockRepository.getDreamsForFeed.mockRejectedValue(new Error("DB Error"));

      await expect(service.getDreamsForFeed()).rejects.toThrow(
        "Error obteniendo los sueños públicos: Error: DB Error"
      );
    });
  });

  describe("DreamNodeService - getUserDreamStats", () => {
    let service: DreamNodeService;
    let mockRepository: jest.Mocked<IDreamNodeRepository>;

    beforeEach(() => {
      mockRepository = {
        getUserDreamNodes: jest.fn(),
      } as unknown as jest.Mocked<IDreamNodeRepository>;

      service = new DreamNodeService(mockRepository);
    });

    it("should return stats correctly when user has dreams", async () => {
      const userId = "user123";

      const nodes = [
        { id: "1", creationDate: new Date("2025-01-01T10:00:00Z") },
        { id: "2", creationDate: new Date("2024-12-31T10:00:00Z") },
      ];

      mockRepository.getUserDreamNodes.mockResolvedValue(nodes as any);

      const result = await service.getUserDreamStats(userId);

      expect(mockRepository.getUserDreamNodes).toHaveBeenCalledWith(userId);

      expect(result).toEqual({
        dreamCount: 2,
        lastDreamAt: new Date("2025-01-01T10:00:00Z"),
      });
    });
    it("should return dreamCount = 0 and lastDreamAt = null when user has no dreams", async () => {
      const userId = "user123";

      mockRepository.getUserDreamNodes.mockResolvedValue([]);

      const result = await service.getUserDreamStats(userId);

      expect(result).toEqual({
        dreamCount: 0,
        lastDreamAt: null,
      });
    });

    it("should return lastDreamAt = null if list is not empty but first item is undefined (edge case)", async () => {
      const userId = "user123";

      mockRepository.getUserDreamNodes.mockResolvedValue([undefined] as any);

      const result = await service.getUserDreamStats(userId);

      expect(result).toEqual({
        dreamCount: 1,
        lastDreamAt: null,
      });
    });

    it("should throw if repository fails", async () => {
      const userId = "user123";

      mockRepository.getUserDreamNodes.mockRejectedValue(
        new Error("DB exploded")
      );

      await expect(service.getUserDreamStats(userId)).rejects.toThrow(
        "DB exploded"
      );
    });
  });
});
