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
        }
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
        errors: 'Error al reinterpretar el sueño'
      });
    });

    it("debería manejar errores al reinterpretar", async () => {
      mockInterpretationService.reinterpretDream.mockRejectedValueOnce(
        new Error("Error simulado")
      );

      await controller.reinterpret(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
expect(mockRes.json).toHaveBeenCalledWith({
        errors: 'Error al reinterpretar el sueño',
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
        emotion: "Felicidad",
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
        emotion: "Felicidad",
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
});