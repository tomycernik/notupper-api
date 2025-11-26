import { SkinService } from '../../../../src/application/services/skin.service';
import { ISkinRepository } from '../../../../src/domain/repositories/skin.repository';
import { ICoinRepository } from '../../../../src/domain/repositories/coin.repository';

describe('SkinService - buySkin', () => {
  let skinService: SkinService;
  let mockSkinRepository: jest.Mocked<ISkinRepository>;
  let mockCoinRepository: jest.Mocked<ICoinRepository>;

  const mockSkin = {
    id: 'skin1',
    name: 'Test Skin',
    price: 100,
    description: 'A test skin',
    imageUrl: 'https://example.com/skin.jpg',
    createdAt: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    mockSkinRepository = {
      userHasSkin: jest.fn(),
      findById: jest.fn(),
      addSkinToUser: jest.fn(),
      getUserSkins: jest.fn(),
      getAllSkins: jest.fn(),
      getDefaultSkins: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addCompatibleRoom: jest.fn(),
      removeCompatibleRoom: jest.fn(),
      setOwnershipStatus: jest.fn(),
      getCompatibleSkins: jest.fn()
    } as any;

    mockCoinRepository = {
      deductCoins: jest.fn(),
      registerMovement: jest.fn(),
      getUserCoins: jest.fn(),
      addCoins: jest.fn(),
      getMovements: jest.fn()
    } as any;

    skinService = new SkinService(mockSkinRepository, mockCoinRepository);
  });

  describe('buySkin', () => {
    it('should successfully buy a skin', async () => {
      // Setup
      mockSkinRepository.userHasSkin.mockResolvedValue(false);
      mockSkinRepository.findById.mockResolvedValue(mockSkin);
      mockCoinRepository.deductCoins.mockResolvedValue();
      mockCoinRepository.registerMovement.mockResolvedValue();
      mockSkinRepository.addSkinToUser.mockResolvedValue();

      // Execute
      await skinService.buySkin('user1', 'skin1');

      // Assert
      expect(mockSkinRepository.userHasSkin).toHaveBeenCalledWith('user1', 'skin1');
      expect(mockSkinRepository.findById).toHaveBeenCalledWith('skin1');
      expect(mockCoinRepository.deductCoins).toHaveBeenCalledWith('user1', 100);
      expect(mockCoinRepository.registerMovement).toHaveBeenCalledWith(
        'user1',
        100,
        'egreso',
        'Compra skin Test Skin'
      );
      expect(mockSkinRepository.addSkinToUser).toHaveBeenCalledWith('user1', 'skin1');
    });

    it('should throw error if user already has the skin', async () => {
      // Setup
      mockSkinRepository.userHasSkin.mockResolvedValue(true);

      // Execute & Assert
      await expect(skinService.buySkin('user1', 'skin1'))
        .rejects.toThrow('Ya tienes este skin');

      expect(mockSkinRepository.userHasSkin).toHaveBeenCalledWith('user1', 'skin1');
      expect(mockSkinRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error if skin not found', async () => {
      // Setup
      mockSkinRepository.userHasSkin.mockResolvedValue(false);
      mockSkinRepository.findById.mockResolvedValue(null);

      // Execute & Assert
      await expect(skinService.buySkin('user1', 'skin1'))
        .rejects.toThrow('Skin no encontrado');

      expect(mockSkinRepository.userHasSkin).toHaveBeenCalledWith('user1', 'skin1');
      expect(mockSkinRepository.findById).toHaveBeenCalledWith('skin1');
      expect(mockCoinRepository.deductCoins).not.toHaveBeenCalled();
    });

    it('should throw error for invalid price', async () => {
      // Setup
      const skinWithInvalidPrice = { ...mockSkin, price: 0 };
      mockSkinRepository.userHasSkin.mockResolvedValue(false);
      mockSkinRepository.findById.mockResolvedValue(skinWithInvalidPrice);

      // Execute & Assert
      await expect(skinService.buySkin('user1', 'skin1'))
        .rejects.toThrow('Precio inválido');

      expect(mockCoinRepository.deductCoins).not.toHaveBeenCalled();
    });

    it('should propagate deductCoins error (insufficient balance)', async () => {
      // Setup
      mockSkinRepository.userHasSkin.mockResolvedValue(false);
      mockSkinRepository.findById.mockResolvedValue(mockSkin);
      mockCoinRepository.deductCoins.mockRejectedValue(new Error('Saldo insuficiente'));

      // Execute & Assert
      await expect(skinService.buySkin('user1', 'skin1'))
        .rejects.toThrow('Saldo insuficiente');

      expect(mockCoinRepository.deductCoins).toHaveBeenCalledWith('user1', 100);
      expect(mockCoinRepository.registerMovement).not.toHaveBeenCalled();
      expect(mockSkinRepository.addSkinToUser).not.toHaveBeenCalled();
    });
  });
});