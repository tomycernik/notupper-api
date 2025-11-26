import request from 'supertest';
import express from 'express';
import { SkinController } from '../../../../src/infrastructure/controllers/skin.controller';
import { SkinService } from '../../../../src/application/services/skin.service';
import { MembershipService } from '../../../../src/application/services/membership.service';

// Mock the services
jest.mock('../../../../src/application/services/skin.service');
jest.mock('../../../../src/application/services/membership.service');

describe('SkinController - buySkin Route', () => {
  let app: express.Application;
  let mockSkinService: jest.Mocked<SkinService>;
  let mockMembershipService: jest.Mocked<MembershipService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock services
    mockSkinService = {
      buySkin: jest.fn(),
      getAllSkins: jest.fn(),
      getUserSkins: jest.fn(),
      addSkinToUser: jest.fn(),
      getSkinById: jest.fn(),
      getDefaultSkins: jest.fn(),
      getCompatibleSkins: jest.fn(),
      createSkin: jest.fn(),
      updateSkin: jest.fn(),
      deleteSkin: jest.fn(),
      addCompatibleRoom: jest.fn(),
      removeCompatibleRoom: jest.fn()
    } as any;

    mockMembershipService = {
      getUserMembership: jest.fn()
    } as any;

    // Mock the authenticateToken middleware to add userId
    jest.mock('../../../../src/infrastructure/middlewares/auth.middleware', () => ({
      authenticateToken: (req: any, res: any, next: any) => {
        req.userId = 'test-user-123';
        next();
      }
    }));

    // Create controller and app
    const skinController = new SkinController(mockSkinService, mockMembershipService);
    app = express();
    app.use(express.json());

    // Add auth middleware that sets userId
    app.use((req: any, res, next) => {
      req.userId = 'test-user-123';
      next();
    });

    // Add the route we want to test
    app.post('/api/skins/buy', (req, res) => skinController.buySkin(req, res));
  });

  describe('POST /api/skins/buy', () => {
    it('should successfully buy a skin', async () => {
      // Setup
      mockSkinService.buySkin.mockResolvedValue();

      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({ skinId: 'skin-123' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Skin comprado exitosamente'
      });
      expect(mockSkinService.buySkin).toHaveBeenCalledWith('test-user-123', 'skin-123');
    });

    it('should return 400 if skinId is missing', async () => {
      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'El ID del skin es requerido'
      });
      expect(mockSkinService.buySkin).not.toHaveBeenCalled();
    });

    it('should return 409 if user already has the skin', async () => {
      // Setup
      mockSkinService.buySkin.mockRejectedValue(new Error('Ya tienes este skin'));

      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({ skinId: 'skin-123' });

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        success: false,
        message: 'Ya tienes este skin',
        errors: ['Ya tienes este skin']
      });
      expect(mockSkinService.buySkin).toHaveBeenCalledWith('test-user-123', 'skin-123');
    });

    it('should return 404 if skin not found', async () => {
      // Setup
      mockSkinService.buySkin.mockRejectedValue(new Error('Skin no encontrado'));

      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({ skinId: 'invalid-skin' });

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Skin no encontrado',
        errors: ['Skin no encontrado']
      });
    });

    it('should return 400 if insufficient balance', async () => {
      // Setup
      mockSkinService.buySkin.mockRejectedValue(new Error('Saldo insuficiente'));

      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({ skinId: 'skin-123' });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Saldo insuficiente',
        errors: ['Saldo insuficiente']
      });
    });

    it('should return 500 for unexpected errors', async () => {
      // Setup
      mockSkinService.buySkin.mockRejectedValue(new Error('Database connection failed'));

      // Execute
      const response = await request(app)
        .post('/api/skins/buy')
        .send({ skinId: 'skin-123' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Database connection failed',
        errors: ['Database connection failed']
      });
    });

    it('should handle missing userId (unauthorized)', async () => {
      // Create app without auth middleware
      const appNoAuth = express();
      appNoAuth.use(express.json());
      const skinController = new SkinController(mockSkinService, mockMembershipService);
      appNoAuth.post('/api/skins/buy', (req, res) => skinController.buySkin(req, res));

      // Execute
      const response = await request(appNoAuth)
        .post('/api/skins/buy')
        .send({ skinId: 'skin-123' });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: 'No autorizado'
      });
      expect(mockSkinService.buySkin).not.toHaveBeenCalled();
    });
  });
});