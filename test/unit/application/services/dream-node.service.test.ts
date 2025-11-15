import { DreamNodeService } from "../../../../src/application/services/dream-node.service";
import { IDreamNodeRepository } from "../../../../src/domain/repositories/dream-node.repository";
import { SaveDreamNodeRequestDto } from "../../../../src/infrastructure/dtos/dream-node";
import { DreamContext } from "../../../../src/domain/interfaces/interpretation-dream.interface";

jest.mock("../../../../src/config/envs", () => ({
  envs: {
    SUPABASE_URL: "https://mock.supabase.co",
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
      imageUrl: "https://mock.supabase.co/storage/v1/object/public/image1.jpg",
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
        imageUrl: node.imageUrl,
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should clean imageUrl if it’s invalid", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño sin imagen válida",
      description: "Descripción del sueño",
      interpretation: "Interpretación del sueño",
      emotion: "miedo",
      imageUrl: "https://otro-servidor.com/imagen.jpg",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        emotion: node.emotion,
        privacy: "Privado",
        state: "Activo",
        imageUrl: "",
        interpretation: node.interpretation,
        creationDate: expect.any(Date),
        type: "Estandar"
      }),
      userId,
      "Estandar"
    );
  });

  it("should handle missing imageUrl gracefully", async () => {
    const userId = "user123";
    const node: SaveDreamNodeRequestDto = {
      title: "Sueño sin imagen",
      description: "Sin imagen",
      interpretation: "Nada relevante",
      emotion: "tristeza",
      imageUrl: "",
      dreamType: "Estandar"
    };

    await service.saveDreamNode(userId, node, dreamContext);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: node.title,
        dream_description: node.description,
        emotion: node.emotion,
        privacy: "Privado",
        state: "Activo",
        imageUrl: node.imageUrl,
        interpretation: node.interpretation,
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
      imageUrl: "https://mock.supabase.co/storage/v1/object/public/image2.jpg",
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
      getPublicDreams: jest.fn(),
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

  describe("getPublicDreams", () => {
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

      mockRepository.getPublicDreams.mockResolvedValue(mockPublicDreams as any);
      mockRepository.countPublicDreams.mockResolvedValue(2);

      const result = await service.getPublicDreams({ page: 1, limit: 10 });

      expect(mockRepository.getPublicDreams).toHaveBeenCalledWith({
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
      mockRepository.getPublicDreams.mockResolvedValue([]);
      mockRepository.countPublicDreams.mockResolvedValue(25);

      const result = await service.getPublicDreams({ page: 2, limit: 10 });

      expect(mockRepository.getPublicDreams).toHaveBeenCalledWith({
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
      mockRepository.getPublicDreams.mockResolvedValue([]);
      mockRepository.countPublicDreams.mockResolvedValue(0);

      await service.getPublicDreams();

      expect(mockRepository.getPublicDreams).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it("should throw error if repository fails", async () => {
      mockRepository.getPublicDreams.mockRejectedValue(new Error("DB Error"));

      await expect(service.getPublicDreams()).rejects.toThrow(
        "Error obteniendo los sueños públicos: Error: DB Error"
      );
    });
  });
});
