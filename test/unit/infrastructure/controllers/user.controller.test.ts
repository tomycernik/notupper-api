jest.mock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_KEY: 'fake-key',
    SUPABASE_JWT_SECRET: 'secret',
    PORT: 3000,
    OPENAI_API_KEY: 'fake-key'
  }
}));

import { Request, Response } from 'express';
import { UserController } from '../../../../src/infrastructure/controllers/user.controller';
import { UserService } from '../../../../src/application/services/user.service';
import { SkinService } from '../../../../src/application/services/skin.service';
import { RoomService } from '../../../../src/application/services/room.service';
import { GetUserSkinsResponseDto } from '../../../../src/infrastructure/dtos/skin/get-user-skins.dto';
import { GetUserRoomsResponseDto } from '../../../../src/infrastructure/dtos/room/get-user-rooms.dto';
import { BadgeService } from '@/application/services/badge.service';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockSkinService: jest.Mocked<SkinService>;
  let mockRoomService: jest.Mocked<RoomService>;
  let mockBadgeService: jest.Mocked<BadgeService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockUserService = {
      register: jest.fn(),
      login: jest.fn()
    } as any;

    mockSkinService = {
      getUserSkins: jest.fn(),
      getDefaultSkins: jest.fn()
    } as any;

    mockRoomService = {
      getUserRooms: jest.fn(),
      getDefaultRooms: jest.fn()
    } as any;

    mockBadgeService = {} as any;

    jsonMock = jest.fn();
    mockResponse = {
      json: jsonMock,
      status: jest.fn().mockReturnThis()
    };

    userController = new UserController(mockUserService, mockSkinService, mockRoomService, mockBadgeService);
  });

  describe('getUserSkins', () => {
    it('should return skins successfully', async () => {
      const mockSkins: GetUserSkinsResponseDto = {
        success: true,
        data: [{
          id: '1',
          name: 'Test Skin',
          description: 'A test skin',
          imageUrl: 'https://example.com/skin.png',
          previewLight: 'https://example.com/skin-light.png',
          previewDark: 'https://example.com/skin-dark.png',
          price: { amount: 0, currency: 'coins' },
          createdAt: '2025-10-30T00:00:00Z',
          roomId: 'room1',
          textureSet: {},
          includedInPlan: 'free'
        }]
      };

      mockRequest = {
        userId: 'user1'
      } as any;

      mockSkinService.getUserSkins.mockResolvedValue(mockSkins);

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockSkinService.getUserSkins).toHaveBeenCalledWith('user1');
      expect(jsonMock).toHaveBeenCalledWith(mockSkins);
    });

    it('should handle errors when getting skins', async () => {
      const error = new Error('Failed to get skins');
      mockRequest = {
        userId: 'user1'
      } as any;

      mockSkinService.getUserSkins.mockRejectedValue(error);

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener los skins del usuario',
        error: 'Failed to get skins'
      });
    });

    it('should validate userId parameter', async () => {
      mockRequest = {
        userId: ''
      } as any;

      await userController.getUserSkins(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario no proporcionado'
      });
      expect(mockSkinService.getUserSkins).not.toHaveBeenCalled();
    });
  });

  describe('getUserRooms', () => {
    it('should return rooms successfully', async () => {
      const mockRooms: GetUserRoomsResponseDto = {
        success: true,
        data: [{
          id: '1',
          name: 'Test Room',
          description: 'A test room',
          image_url: 'https://example.com/room.png',
          model_url: 'https://example.com/room.glb',
          price: { amount: 0, currency: 'coins' },
          active: false,
          compatible_textures: ['skin1', 'skin2'],
          included_in_plan: 'free',
          created_at: '2025-10-30T00:00:00Z',
          room_engine_id: 'engine1',
          texture_applied: null,
          texture_default: null
        }]
      };

      mockRequest = {
        userId: 'user1'
      } as any;

      mockRoomService.getUserRooms.mockResolvedValue(mockRooms);

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockRoomService.getUserRooms).toHaveBeenCalledWith('user1');
      expect(jsonMock).toHaveBeenCalledWith(mockRooms);
    });

    it('should handle errors when getting rooms', async () => {
      const error = new Error('Failed to get rooms');
      mockRequest = {
        userId: 'user1'
      } as any;

      mockRoomService.getUserRooms.mockRejectedValue(error);

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener las habitaciones del usuario',
        error: 'Failed to get rooms'
      });
    });

    it('should validate userId parameter', async () => {
      mockRequest = {
        userId: ''
      } as any;

      await userController.getUserRooms(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario no proporcionado'
      });
      expect(mockRoomService.getUserRooms).not.toHaveBeenCalled();
    });
  });

  describe('getPublicProfile', () => {
    beforeEach(() => {
      mockRequest = {
        params: { userId: 'public-user-id' }
      } as any;
      mockBadgeService.getUserFeaturedBadges = jest.fn().mockResolvedValue([{ id: 'badge1' }]);
      mockBadgeService.getUserBadges = jest.fn().mockResolvedValue([{ id: 'badge1' }, { id: 'badge2' }]);
      mockUserService.getUserInfo = jest.fn().mockResolvedValue({ id: 'public-user-id', username: 'publicuser' });
    });

    it('should return public profile data successfully', async () => {
      await userController.getPublicProfile(mockRequest as Request, mockResponse as Response);
      expect(mockUserService.getUserInfo).toHaveBeenCalledWith('public-user-id');
      expect(mockBadgeService.getUserFeaturedBadges).toHaveBeenCalledWith('public-user-id');
      expect(mockBadgeService.getUserBadges).toHaveBeenCalledWith('public-user-id');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        id: 'public-user-id',
        username: 'publicuser',
        badges: expect.any(Array),
        featuredBadges: expect.any(Array)
      }));
    });

    it('should return 400 if userId param is missing', async () => {
      mockRequest.params = {};
      await userController.getPublicProfile(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'ID de usuario no proporcionado',
      });
    });

    it('should handle errors and return 500', async () => {
      mockUserService.getUserInfo = jest.fn().mockRejectedValue(new Error('DB error'));
      await userController.getPublicProfile(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Error al obtener el perfil público del usuario',
        error: 'DB error'
      }));
    });
  });

  describe('setFeaturedBadges', () => {
    beforeEach(() => {
      mockRequest = {
        userId: 'user-123',
        body: { badgeIds: ['badge1', 'badge2', 'badge3'] }
      } as any;
      mockBadgeService.setUserFeaturedBadges = jest.fn().mockResolvedValue(undefined);
    });

    it('should update featured badges successfully', async () => {
      await userController.setFeaturedBadges(mockRequest as Request, mockResponse as Response);
      expect(mockBadgeService.setUserFeaturedBadges).toHaveBeenCalledWith('user-123', ['badge1', 'badge2', 'badge3']);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Insignias destacadas actualizadas' });
    });

    it('should return 400 if badgeIds is not an array of length 3', async () => {
      mockRequest.body.badgeIds = ['badge1'];
      await userController.setFeaturedBadges(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message: 'Debes enviar exactamente 3 badgeIds',
      });
      expect(mockBadgeService.setUserFeaturedBadges).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500', async () => {
      mockBadgeService.setUserFeaturedBadges = jest.fn().mockRejectedValue(new Error('DB error'));
      await userController.setFeaturedBadges(mockRequest as Request, mockResponse as Response);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Error al actualizar insignias destacadas',
        error: 'DB error'
      }));
    });
  });
});