
jest.mock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://mock.supabase.co',
    SUPABASE_KEY: 'mock-key',
    SUPABASE_ANON_KEY: 'mock-anon-key',
    SUPABASE_SERVICE_KEY: 'mock-service-key',
  },
}));

jest.mock('../../../../src/config/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      admin: {
        getUserById: jest.fn(),
      },
    },
  },
}));

const mockGetDreamNodeById = jest.fn();
const mockGetCommentsByNodeWithUser = jest.fn();
const mockCountComments = jest.fn();

jest.mock('../../../../src/application/services/user.service', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    getUserIdByDreamNodeId: jest.fn(),
    getUserNameById: jest.fn(),
    getAvatarUrlById: jest.fn(),
  })),
}));

jest.mock('../../../../src/application/services/notification.service', () => ({
  NotificationService: jest.fn().mockImplementation(() => ({
    saveNotification: jest.fn(),
  })),
}));

jest.mock('../../../../src/application/services/dream-node.service', () => ({
  DreamNodeService: jest.fn().mockImplementation(() => ({
    getDreamNodeById: mockGetDreamNodeById,
  })),
}));

jest.mock('../../../../src/application/services/dream-node-comment.service', () => ({
  DreamNodeCommentService: jest.fn().mockImplementation(() => ({
    getCommentsByNodeWithUser: mockGetCommentsByNodeWithUser,
    countComments: mockCountComments,
  })),
}));

jest.mock('../../../../src/infrastructure/repositories/dream-node.repository.supabase');

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
  let mockUserService: UserService;
  let mockNotificationService: NotificationService;
  let mockDreamNodeService: DreamNodeService;
  let mockCommentService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserService = new UserService({} as any, {} as any, {} as any);
    mockNotificationService = new NotificationService({} as any);
    mockDreamNodeService = new DreamNodeService({} as any);
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
