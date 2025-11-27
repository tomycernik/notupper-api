
import { Request, Response } from 'express';
import { DreamNodeCommentController } from '../../../../src/infrastructure/controllers/dream-node-comment.controller';
import { IDreamNodeCommentWithUser } from '../../../../src/domain/interfaces/dream-node-comment.interface';
import { UserService } from '../../../../src/application/services/user.service';
import { NotificationService } from '../../../../src/application/services/notification.service';
import { DreamNodeService } from '../../../../src/application/services/dream-node.service';

describe('DreamNodeCommentController - getCommentsWithUser', () => {
  let controller: DreamNodeCommentController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockUserService: jest.Mocked<UserService>;
  let mockNotificationService: jest.Mocked<NotificationService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockCommentService: any;
  let mockGetDreamNodeById: jest.Mock;
  let mockGetCommentsByNodeWithUser: jest.Mock;
  let mockCountComments: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetDreamNodeById = jest.fn();
    mockGetCommentsByNodeWithUser = jest.fn();
    mockCountComments = jest.fn();

    mockUserService = {
      getUserIdByDreamNodeId: jest.fn(),
      getUserNameById: jest.fn(),
      getAvatarUrlById: jest.fn(),
    } as any;

    mockNotificationService = {
      saveNotification: jest.fn(),
    } as any;

    mockDreamNodeService = {
      getDreamNodeById: mockGetDreamNodeById,
    } as any;

    mockCommentService = {
      getCommentsByNodeWithUser: mockGetCommentsByNodeWithUser,
      countComments: mockCountComments,
    };

    controller = new DreamNodeCommentController(
      mockUserService,
      mockNotificationService,
      mockDreamNodeService,
      mockCommentService
    );

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    mockRequest = {
      params: {},
    };

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };
  });

  describe('Successful scenarios', () => {
    it('should return comments with user data when dream is public', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      const mockComments: IDreamNodeCommentWithUser[] = [
        {
          id: 'comment-1',
          dream_node_id: mockDreamId,
          profile_id: 'user-1',
          content: 'Great dream!',
          created_at: '2025-11-16T10:00:00Z',
          user: {
            username: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
          },
        },
        {
          id: 'comment-2',
          dream_node_id: mockDreamId,
          profile_id: 'user-2',
          content: 'Amazing interpretation!',
          created_at: '2025-11-16T11:00:00Z',
          user: {
            username: 'anotheruser',
            avatar_url: 'https://example.com/avatar2.jpg',
          },
        },
      ];

      const mockDreamNode = {
        id: mockDreamId,
        title: 'Test Dream',
        privacy: 'Publico',
        state: 'Activo',
      };

      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(mockDreamNode);
      mockGetCommentsByNodeWithUser.mockResolvedValue(mockComments);
      mockCountComments.mockResolvedValue(2);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          comments: mockComments,
          total: 2,
        },
      });
    });

    it('should return empty array when there are no comments', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDreamNode = {
        id: mockDreamId,
        title: 'Test Dream',
        privacy: 'Publico',
        state: 'Activo',
      };

      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(mockDreamNode);
      mockGetCommentsByNodeWithUser.mockResolvedValue([]);
      mockCountComments.mockResolvedValue(0);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          comments: [],
          total: 0,
        },
      });
    });
  });

  describe('Error scenarios', () => {
    it('should return 400 if dream ID is missing', async () => {
      mockRequest.params = {};

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Falta el ID del sueño',
      });
    });

    it('should return 404 if dream is not found', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(null);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Sueño no encontrado',
      });
    });

    it('should return 403 if dream is private', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDreamNode = {
        id: mockDreamId,
        title: 'Private Dream',
        privacy: 'Privado',
        state: 'Activo',
      };

      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(mockDreamNode);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Este sueño no es público. Los comentarios solo están disponibles para sueños públicos.',
      });
    });

    it('should return 403 if dream is anonymous', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDreamNode = {
        id: mockDreamId,
        title: 'Anonymous Dream',
        privacy: 'Anonimo',
        state: 'Activo',
      };

      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(mockDreamNode);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Este sueño no es público. Los comentarios solo están disponibles para sueños públicos.',
      });
    });

    it('should return 500 if service throws an error', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockRejectedValue(new Error('Database error'));

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener comentarios',
        error: 'Database error',
      });
    });

    it('should return 500 if getCommentsByNodeWithUser fails', async () => {
      const mockDreamId = '123e4567-e89b-12d3-a456-426614174000';
      const mockDreamNode = {
        id: mockDreamId,
        title: 'Test Dream',
        privacy: 'Publico',
        state: 'Activo',
      };

      mockRequest.params = { id: mockDreamId };

      mockGetDreamNodeById.mockResolvedValue(mockDreamNode);
      mockGetCommentsByNodeWithUser.mockRejectedValue(new Error('Failed to fetch comments'));
      mockCountComments.mockResolvedValue(0);

      await controller.getCommentsWithUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener comentarios',
        error: 'Failed to fetch comments',
      });
    });
  });
});
