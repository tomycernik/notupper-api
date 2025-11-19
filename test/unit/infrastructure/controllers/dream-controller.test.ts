import 'reflect-metadata';
import { Request, Response } from 'express';
import { DreamNodeController } from '../../../../src/infrastructure/controllers/dream-node.controller';
import { InterpretationDreamService } from '../../../../src/application/services/interpretation-dream.service';
import { DreamNodeService } from '../../../../src/application/services/dream-node.service';
import { IllustrationDreamService } from '../../../../src/application/services/illustration-dream.service';
import { DreamContextService } from '../../../../src/application/services/dream-context.service';
import { IDreamNode } from '../../../../src/domain/models/dream-node.model';
import { IPaginatedResult } from '../../../../src/domain/interfaces/pagination.interface';
import { MembershipService } from '../../../../src/application/services/membership.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

const mockSession: any = {
  id: 'mock-session-id',
  cookie: { path: '/', maxAge: 1000 },
  regenerate: jest.fn(),
  destroy: jest.fn(),
  reload: jest.fn(),
  save: jest.fn(),
  touch: jest.fn(),
  dreamContext: {
    themes: [],
    people: [],
    locations: [],
    emotions_context: [],
  },
};

describe('DreamNodeController Integration Tests', () => {
  let controller: DreamNodeController;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockIllustrationService: jest.Mocked<IllustrationDreamService>;
  let mockContextService: jest.Mocked<DreamContextService>;
  let mockMembershipService: jest.Mocked<MembershipService>;
  // Common mock implementations
  const mockDreamContext = {
    themes: [],
    people: [],
    locations: [],
    emotions_context: []
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    // Mock services
    mockInterpretationService = {
      interpretDream: jest.fn().mockResolvedValue({
        title: 'Test Dream',
        interpretation: 'Test interpretation',
        emotion: 'happy',
        dreamType: 'Estandar',
        context: { ...mockDreamContext }
      }),
      reinterpretDream: jest.fn().mockResolvedValue({
        title: 'Reinterpreted Dream',
        interpretation: 'Reinterpreted content',
        emotion: 'neutral',
        dreamType: 'Estandar'
      })
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn().mockResolvedValue([]),
      getDreamById: jest.fn().mockResolvedValue({
        id: 'dream-123',
        title: 'Test Dream',
        description: 'Test description'
      }),
      getUserNodes: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10
        } as unknown as IPaginatedResult<IDreamNode>),
        onDreamSaved: jest.fn().mockResolvedValue([]),
        onDreamReinterpreted: jest.fn().mockResolvedValue([])
    } as any;

    mockIllustrationService = {
      generateIllustration: jest.fn().mockResolvedValue('https://example.com/image.jpg')
    } as any;

    mockContextService = {
      getUserDreamContext: jest.fn().mockResolvedValue({ ...mockDreamContext })
    } as any;

    mockMembershipService = {
      getUserMembership: jest.fn().mockResolvedValue({
        id: 2,
        name: 'plus',
        durations_month: 1
      })
    } as any;

    controller = new DreamNodeController(
      mockInterpretationService,
      mockDreamNodeService,
      mockIllustrationService,
      mockContextService,
      mockMembershipService
    );
  });

  describe('DreamNodeController.reinterpret', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
      mockReq = {
        body: {
          dreamId: 'test-dream-id',
          description: 'Test dream description',
          previousInterpretation: 'Previous interpretation'
        },
        session: mockSession,
      } as any;
      (mockReq as any).userId = 'test-user-id';

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };
    });

    it('should reinterpret a dream successfully', async () => {
      // Act
      await controller.reinterpret(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        'Test dream description',
        'Previous interpretation',
        {
          themes: [],
          people: [],
          locations: [],
          emotions_context: [],
        },
        undefined
      );
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Reinterpreted Dream',
        interpretation: 'Reinterpreted content',
        emotion: 'neutral'
      }));
    });

    it('should handle errors during reinterpretation', async () => {
      // Arrange
      const error = new Error('Reinterpretation failed');
      mockInterpretationService.reinterpretDream.mockRejectedValueOnce(error);

      // Act
      await controller.reinterpret(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: 'Error al reinterpretar el sueño (OpenAI)',
        details: 'Reinterpretation failed'
      });
    });

    it("debería manejar errores al reinterpretar", async () => {
      mockInterpretationService.reinterpretDream.mockRejectedValueOnce(
        new Error("Error simulado")
      );

      await controller.reinterpret(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: 'Error al reinterpretar el sueño (OpenAI)',
        details: 'Error simulado'
      });
    });
  });

  describe('DreamNodeController.save', () => {
    let mockReq: Partial<Request> & { userId?: string };
    let mockRes: Partial<Response>;
    let saveCallback: (err?: any) => void;

    beforeEach(() => {
      // Create a fresh mock for each test
      const mockSave = jest.fn().mockImplementation((cb) => {
        saveCallback = cb;
        return {
          ...mockSession,
          save: mockSave
        };
      });

      mockReq = {
        userId: 'test-user-id',
        body: {
          title: 'Test Dream',
          description: 'Test description',
          interpretation: 'Test interpretation',
          emotion: 'happy',
          imageUrl: 'https://example.com/image.jpg'
        },
        session: {
          ...mockSession,
          save: mockSave,
          dreamContext: null
        }
      };

      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
      };

      // Mock the service method
      mockDreamNodeService.saveDreamNode.mockResolvedValue([]);
    });

    it('should save a dream node successfully', async () => {
      // Arrange
      const expectedDreamNode = {
        title: 'Test Dream',
        description: 'Test description',
        interpretation: 'Test interpretation',
        emotion: 'happy',
        imageUrl: 'https://example.com/image.jpg'
      };

      // Act
      const savePromise = controller.save(mockReq as Request, mockRes as Response);

      // Simulate session save completion
      if (saveCallback) {
        saveCallback();
      }

      // Wait for the controller to complete
      await savePromise;

      // Assert
      expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining(expectedDreamNode),
        expect.objectContaining({
          themes: expect.any(Array),
          people: expect.any(Array),
          locations: expect.any(Array),
          emotions_context: expect.any(Array)
        })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Nodo de sueño guardado exitosamente',
        errors: [],
        unlockedBadges: []
      });
    });

    it('should handle missing session context', async () => {
      // Arrange
      delete mockReq.session?.dreamContext;
      const expectedDreamContext = {
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      };

      // Act
      await controller.save(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockDreamNodeService.saveDreamNode).toHaveBeenCalledWith(
        'test-user-id',
        {
          title: 'Test Dream',
          description: 'Test description',
          emotion: 'happy',
          imageUrl: 'https://example.com/image.jpg',
          interpretation: 'Test interpretation'
        },
        expectedDreamContext
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle save errors', async () => {
      // Arrange
      const error = new Error('Save failed');
      mockDreamNodeService.saveDreamNode.mockRejectedValueOnce(error);

      // Act
      await controller.save(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        errors: [expect.any(String)]
      });
    });
  });

  describe("DreamNodeController.getUserNodes", () => {
    let mockRequest: Partial<Request> & {
      validatedQuery?: any;
      userId?: string;
    };
    let mockResponse: Partial<Response>;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it("should return paginated result with filters and pagination", async () => {
      const userId = "mocked-user-id";
      const filters = {
        state: "Activo",
        privacy: "Publico",
        emotion: "Felicidad",
        search: "test",
      };
      const pagination = { page: 1, limit: 10 };
      const mockDreamNode: IDreamNode = {
        id: "dream-node-id",
        title: "Test Dream",
        dream_description: "Test Description",
        interpretation: "Test Interpretation",
        privacy: "Publico",
        state: "Activo",
        emotion: "Alegría",
        creationDate: new Date(),
        type: "Estandar"
      };
      const expectedResult: IPaginatedResult<IDreamNode> = {
        data: [mockDreamNode],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockRequest.validatedQuery = { ...filters, ...pagination };
      mockRequest.userId = userId;
      mockDreamNodeService.getUserNodes.mockResolvedValue(expectedResult);

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should filter by dreamType", async () => {
      const userId = "mocked-user-id";
      const filters = {
        dreamType: "Lucido",
      };
      const pagination = { page: 1, limit: 10 };
      const mockDreamNode: IDreamNode = {
        id: "dream-node-id",
        title: "Lucid Dream",
        dream_description: "A lucid dream",
        interpretation: "Test Interpretation",
        privacy: "Privado",
        state: "Activo",
        emotion: "Alegría",
        creationDate: new Date(),
        type: "Lucido"
      };
      const expectedResult: IPaginatedResult<IDreamNode> = {
        data: [mockDreamNode],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockRequest.validatedQuery = { dreamType: "Lucido", ...pagination };
      mockRequest.userId = userId;
      mockDreamNodeService.getUserNodes.mockResolvedValue(expectedResult);

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should filter by dreamType and other filters combined", async () => {
      const userId = "mocked-user-id";
      const filters = {
        dreamType: "Pesadilla",
        emotion: "Miedo",
        state: "Activo",
      };
      const pagination = { page: 1, limit: 10 };
      const mockDreamNode: IDreamNode = {
        id: "dream-node-id",
        title: "Nightmare Dream",
        dream_description: "A scary dream",
        interpretation: "Test Interpretation",
        privacy: "Privado",
        state: "Activo",
        emotion: "Miedo",
        creationDate: new Date(),
        type: "Pesadilla"
      };
      const expectedResult: IPaginatedResult<IDreamNode> = {
        data: [mockDreamNode],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockRequest.validatedQuery = { dreamType: "Pesadilla", emotion: "Miedo", state: "Activo", ...pagination };
      mockRequest.userId = userId;
      mockDreamNodeService.getUserNodes.mockResolvedValue(expectedResult);

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 400 when userId is missing", async () => {
      mockRequest.userId = "";

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: "El id del usuario es requerido",
      });
    });

    it("should return 500 when service throws an error", async () => {
      const userId = "mocked-user-id";
      const filters = {
        state: "Activo",
        privacy: "Publico",
        emotion: "Felicidad",
        search: "test",
      };
      const pagination = { page: 1, limit: 10 };

      mockRequest.userId = userId;
      mockRequest.validatedQuery = { ...filters, ...pagination };
      mockDreamNodeService.getUserNodes.mockRejectedValue(
        new Error("Service error")
      );

      await controller.getUserNodes(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockDreamNodeService.getUserNodes).toHaveBeenCalledWith(
        userId,
        filters,
        pagination
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: "Error al obtener los nodos de sueño del usuario",
      });
    });
  });

  describe('share', () => {
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
      mockRequest = {
        userId: 'user-123',
        params: { id: 'dream-456' },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should share a dream successfully', async () => {
      const sharedDream = { id: 'dream-456', privacy: 'Publico' };
      mockDreamNodeService.shareDream = jest.fn().mockResolvedValue(sharedDream);

      await controller.share(mockRequest, mockResponse);

      expect(mockDreamNodeService.shareDream).toHaveBeenCalledWith('user-123', 'dream-456');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sueño compartido exitosamente',
        data: sharedDream,
        errors: [],
      });
    });

    it('should return 400 if dream id is missing', async () => {
      mockRequest.params = {};

      await controller.share(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ID del sueño es requerido',
        errors: ["El parámetro 'id' es obligatorio"],
      });
    });

    it('should return 500 if service throws error', async () => {
      mockDreamNodeService.shareDream = jest.fn().mockRejectedValue(new Error('Share failed'));

      await controller.share(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        errors: ['Share failed'],
      });
    });
  });

  describe('unshare', () => {
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
      mockRequest = {
        userId: 'user-123',
        params: { id: 'dream-456' },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should unshare a dream successfully', async () => {
      const unsharedDream = { id: 'dream-456', privacy: 'Privado' };
      mockDreamNodeService.unshareDream = jest.fn().mockResolvedValue(unsharedDream);

      await controller.unshare(mockRequest, mockResponse);

      expect(mockDreamNodeService.unshareDream).toHaveBeenCalledWith('user-123', 'dream-456');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Sueño descompartido exitosamente',
        data: unsharedDream,
        errors: [],
      });
    });

    it('should return 400 if dream id is missing', async () => {
      mockRequest.params = {};

      await controller.unshare(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'ID del sueño es requerido',
        errors: ["El parámetro 'id' es obligatorio"],
      });
    });

    it('should return 500 if service throws error', async () => {
      mockDreamNodeService.unshareDream = jest.fn().mockRejectedValue(new Error('Unshare failed'));

      await controller.unshare(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        errors: ['Unshare failed'],
      });
    });
  });

  describe('getPublicDreams', () => {
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
      mockRequest = {
        query: { page: '1', limit: '10' },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should return public dreams with pagination', async () => {
      const mockPublicDreams = {
        data: [
          {
            id: 'dream-1',
            title: 'Public Dream 1',
            privacy: 'Publico',
            owner: { id: 'user-1', username: 'user1', avatar_url: 'avatar1.jpg' },
          },
        ],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockDreamNodeService.getPublicDreams = jest.fn().mockResolvedValue(mockPublicDreams);

      await controller.getPublicDreams(mockRequest, mockResponse);

      expect(mockDreamNodeService.getPublicDreams).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockResponse.json).toHaveBeenCalledWith(mockPublicDreams);
    });

    it('should use default pagination if not provided', async () => {
      mockRequest.query = {};

      const mockPublicDreams = {
        data: [],
        pagination: {
          currentPage: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      mockDreamNodeService.getPublicDreams = jest.fn().mockResolvedValue(mockPublicDreams);

      await controller.getPublicDreams(mockRequest, mockResponse);

      expect(mockDreamNodeService.getPublicDreams).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(mockResponse.json).toHaveBeenCalledWith(mockPublicDreams);
    });

    it('should return 500 if service throws error', async () => {
      mockDreamNodeService.getPublicDreams = jest.fn().mockRejectedValue(new Error('DB Error'));

      await controller.getPublicDreams(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error interno del servidor',
        errors: ['DB Error'],
      });
    });
  });
});
