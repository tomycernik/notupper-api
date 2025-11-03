jest.mock('../../../../src/config/envs', () => ({
    envs: {
        SUPABASE_URL: 'https://fake.supabase.co',
        SUPABASE_KEY: 'fake-key',
        SUPABASE_JWT_SECRET: 'secret',
        PORT: 3000,
        OPENAI_API_KEY: 'fake-key'
    }
}));

import { SkinRepositorySupabase } from '../../../../src/infrastructure/repositories/skin.repository.supabase';
import { SkinService } from '../../../../src/application/services/skin.service';
import { Skin } from '../../../../src/domain/interfaces/skin.interface';

describe('SkinService', () => {
  let skinService: SkinService;
  let mockSkinRepository: jest.Mocked<SkinRepositorySupabase>;

  const createMockSkin = (override: Partial<Skin> = {}): Skin => ({
    id: '1',
    name: 'Light Theme',
    description: 'A light theme',
    imageUrl: 'https://example.com/skin1.png',
    previewLight: 'https://example.com/preview-light.png',
    previewDark: 'https://example.com/preview-dark.png',
    createdAt: '2025-10-30T00:00:00Z',
    roomId: 'room1',
    textureSet: { walls_light: '', walls_dark: '', objects_light: '', objects_dark: '' },
    ...override
  });

  const mockSkins: Skin[] = [
    createMockSkin(),
    createMockSkin({
      id: '2',
      name: 'Dark Theme',
      description: 'A dark theme',
      imageUrl: 'https://example.com/skin2.png',
      price: 100,
      includedInPlan: 'premium',
      roomId: 'room2'
    })
  ];

  beforeEach(() => {
    mockSkinRepository = {
      getUserSkins: jest.fn(),
      getDefaultSkins: jest.fn(),
      findById: jest.fn(),
      getCompatibleSkins: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      addCompatibleRoom: jest.fn(),
      removeCompatibleRoom: jest.fn(),
      setOwnershipStatus: jest.fn()
    } as any;

    skinService = new SkinService(mockSkinRepository);
  });

  describe('getUserSkins', () => {
    it('should return skins successfully', async () => {
      mockSkinRepository.getUserSkins.mockResolvedValue(mockSkins);

      const result = await skinService.getUserSkins('user1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(expect.objectContaining({
        id: '1',
        name: 'Light Theme',
        description: 'A light theme',
        imageUrl: 'https://example.com/skin1.png',
        previewLight: 'https://example.com/preview-light.png',
        previewDark: 'https://example.com/preview-dark.png',
        roomId: 'room1',
        price: null,
        createdAt: expect.any(String)
      }));
      expect(mockSkinRepository.getUserSkins).toHaveBeenCalledWith('user1');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockSkinRepository.getUserSkins.mockRejectedValue(error);

      const result = await skinService.getUserSkins('user1');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('Database error');
      expect(mockSkinRepository.getUserSkins).toHaveBeenCalledWith('user1');
    });

    it('should handle empty userId', async () => {
      const result = await skinService.getUserSkins('');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('ID de usuario no proporcionado');
      expect(mockSkinRepository.getUserSkins).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultSkins', () => {
    it('should return default skins successfully', async () => {
      mockSkinRepository.getDefaultSkins.mockResolvedValue(mockSkins);

      const result = await skinService.getDefaultSkins();

      expect(result).toEqual(mockSkins);
      expect(mockSkinRepository.getDefaultSkins).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockSkinRepository.getDefaultSkins.mockRejectedValue(error);

      const result = await skinService.getDefaultSkins();
      expect(result).toEqual([]);
      expect(mockSkinRepository.getDefaultSkins).toHaveBeenCalled();
    });
  });

  describe('updateSkin', () => {
    it('should update skin successfully', async () => {
      const existingSkin = createMockSkin();
      const updateData: Partial<Skin> = { name: 'Updated Name' };
      const updatedSkin = createMockSkin({ ...updateData });

      mockSkinRepository.findById.mockResolvedValue(existingSkin);
      mockSkinRepository.update.mockResolvedValue(updatedSkin);

      const result = await skinService.updateSkin('1', updateData);

      expect(result).toEqual(updatedSkin);
      expect(mockSkinRepository.findById).toHaveBeenCalledWith('1');
      expect(mockSkinRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw error when skin not found', async () => {
      mockSkinRepository.findById.mockResolvedValue(null);

      await expect(skinService.updateSkin('999', { name: 'New Name' }))
        .rejects.toThrow('Skin no encontrado');
    });

    it('should validate update data', async () => {
      const existingSkin = createMockSkin();
      mockSkinRepository.findById.mockResolvedValue(existingSkin);

      await expect(skinService.updateSkin('1', { name: '' }))
        .rejects.toThrow('El nombre del skin no puede estar vacío');

      await expect(skinService.updateSkin('1', { price: -100 }))
        .rejects.toThrow('El precio no puede ser negativo');
    });
  });
});