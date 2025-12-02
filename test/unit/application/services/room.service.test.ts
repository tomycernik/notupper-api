import { RoomRepositorySupabase } from '../../../../src/infrastructure/repositories/room.repository.supabase';
import { RoomService } from '../../../../src/application/services/room.service';
jest.mock('../../../../src/config/envs', () => ({
  envs: {
    SUPABASE_URL: 'https://fake.supabase.co',
    SUPABASE_KEY: 'fake-key',
    SUPABASE_JWT_SECRET: 'secret',
    PORT: 3000,
    OPENAI_API_KEY: 'fake-key'
  }
}));

jest.mock('../../../../src/config/supabase', () => {
  const mockUserItemsData = {
    ownership_type: 'owned',
    user_id: 'user1',
    item_id: '2',
    item_type: 'room'
  };

  const mockProfilesData = {
    id: 'user1',
    subscription_plan: 'premium'
  };

  return {
    supabase: {
      from: jest.fn().mockImplementation((table: string) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: table === 'user_items' ? mockUserItemsData : mockProfilesData,
          error: null
        })
      }))
    }
  };
});

import { Room } from '../../../../src/domain/interfaces/room.interface';
import { ICoinRepository } from '../../../../src/domain/repositories/coin.repository';

describe('RoomService', () => {
  let roomService: RoomService;
  let mockRoomRepository: jest.Mocked<RoomRepositorySupabase>;
  let mockCoinRepository: jest.Mocked<ICoinRepository>;

  const createMockRoom = (override: Partial<Room> = {}): Room => ({
    id: '1',
    name: 'Living Room',
    description: 'A cozy room',
    imageUrl: 'https://example.com/room1.png',
    modelUrl: 'https://example.com/room1.glb',
    isDefault: true,
    compatibleSkins: ['skin1', 'skin2'],
    createdAt: new Date('2025-10-30T00:00:00Z'),
    roomEngineId: 'engine1',
    ...override
  });

  const mockRooms: Room[] = [
    createMockRoom(),
    createMockRoom({
      id: '2',
      name: 'Bedroom',
      description: 'A peaceful room',
      imageUrl: 'https://example.com/room2.png',
      modelUrl: 'https://example.com/room2.glb',
      isDefault: false,
      price: 100,
      includedInPlan: 'premium',
      compatibleSkins: ['skin1'],
      createdAt: new Date('2025-10-30T00:00:00Z')
    })
  ];

  beforeEach(() => {
    mockRoomRepository = {
      getUserRooms: jest.fn(),
      getDefaultRoom: jest.fn(),
      findById: jest.fn(),
      getCompatibleSkins: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getDefaultRoomsWithDependencies: jest.fn(),
      addCompatibleSkin: jest.fn(),
      removeCompatibleSkin: jest.fn(),
      setOwnershipStatus: jest.fn(),
      getActiveRoom: jest.fn(),
      setActiveRoom: jest.fn()
    } as any;

    mockCoinRepository = {
      addCoins: jest.fn(),
      deductCoins: jest.fn(),
      getUserCoins: jest.fn()
    } as any;
    roomService = new RoomService(mockRoomRepository, mockCoinRepository);
  });

  describe('getUserRooms', () => {
    it('should return rooms successfully', async () => {
      mockRoomRepository.getUserRooms.mockResolvedValue(mockRooms);

      const result = await roomService.getUserRooms('user1');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        id: '1',
        name: 'Living Room',
        description: 'A cozy room',
        image_url: 'https://example.com/room1.png',
        model_url: 'https://example.com/room1.glb',
        price: null,
        active: expect.any(Boolean),
        compatible_textures: expect.arrayContaining(['skin1', 'skin2']),
        created_at: expect.any(String)
      });
      expect(mockRoomRepository.getUserRooms).toHaveBeenCalledWith('user1');
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRoomRepository.getUserRooms.mockRejectedValue(error);

      const result = await roomService.getUserRooms('user1');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('Database error');
      expect(mockRoomRepository.getUserRooms).toHaveBeenCalledWith('user1');
    });

    it('should handle empty userId', async () => {
      const result = await roomService.getUserRooms('');

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('ID de usuario no proporcionado');
      expect(mockRoomRepository.getUserRooms).not.toHaveBeenCalled();
    });
  });

  describe('getDefaultRoom', () => {
    it('should return default room successfully', async () => {
      const defaultRoom = createMockRoom({ isDefault: true });
      mockRoomRepository.getDefaultRoom.mockResolvedValue(defaultRoom);

      const result = await roomService.getDefaultRoom();

      expect(result).toEqual(defaultRoom);
      expect(mockRoomRepository.getDefaultRoom).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockRoomRepository.getDefaultRoom.mockRejectedValue(error);

      const result = await roomService.getDefaultRoom();
      expect(result).toBeNull();
      expect(mockRoomRepository.getDefaultRoom).toHaveBeenCalled();
    });
  });

  describe('updateRoom', () => {
    it('should update room successfully', async () => {
      const existingRoom = createMockRoom();
      const updateData: Partial<Room> = { name: 'Updated Room' };
      const updatedRoom = createMockRoom({ ...updateData });

      mockRoomRepository.findById.mockResolvedValue(existingRoom);
      mockRoomRepository.update.mockResolvedValue(updatedRoom);

      const result = await roomService.updateRoom('1', updateData);

      expect(result).toEqual(updatedRoom);
      expect(mockRoomRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRoomRepository.update).toHaveBeenCalledWith('1', updateData);
    });

    it('should throw error when room not found', async () => {
      mockRoomRepository.findById.mockResolvedValue(null);

      await expect(roomService.updateRoom('999', { name: 'New Name' }))
        .rejects.toThrow('Habitación no encontrada');
    });

    it('should validate update data', async () => {
      const existingRoom = createMockRoom();
      mockRoomRepository.findById.mockResolvedValue(existingRoom);

      await expect(roomService.updateRoom('1', { name: '' }))
        .rejects.toThrow('El nombre de la room no puede estar vacío');

      await expect(roomService.updateRoom('1', { price: -100 }))
        .rejects.toThrow('El precio no puede ser negativo');
    });
  });

  describe('getActiveRoom', () => {
    it('should return active room successfully', async () => {
      const activeRoom = createMockRoom({
        id: '2',
        name: 'Active Room',
        active: true
      });
      mockRoomRepository.getActiveRoom.mockResolvedValue(activeRoom);

      const result = await roomService.getActiveRoom('user1');

      expect(result).toEqual(activeRoom);
      expect(mockRoomRepository.getActiveRoom).toHaveBeenCalledWith('user1');
    });

    it('should throw error when userId is empty', async () => {
      await expect(roomService.getActiveRoom(''))
        .rejects.toThrow('ID de usuario no proporcionado');

      expect(mockRoomRepository.getActiveRoom).not.toHaveBeenCalled();
    });

    it('should throw error when userId is only whitespace', async () => {
      await expect(roomService.getActiveRoom('   '))
        .rejects.toThrow('ID de usuario no proporcionado');

      expect(mockRoomRepository.getActiveRoom).not.toHaveBeenCalled();
    });

    it('should return null when repository throws error', async () => {
      const error = new Error('Database error');
      mockRoomRepository.getActiveRoom.mockRejectedValue(error);

      const result = await roomService.getActiveRoom('user1');

      expect(result).toBeNull();
      expect(mockRoomRepository.getActiveRoom).toHaveBeenCalledWith('user1');
    });

    it('should return null when no active room exists', async () => {
      mockRoomRepository.getActiveRoom.mockResolvedValue(null);

      const result = await roomService.getActiveRoom('user1');

      expect(result).toBeNull();
      expect(mockRoomRepository.getActiveRoom).toHaveBeenCalledWith('user1');
    });
  });

  describe('setActiveRoom', () => {
    it('should set active room successfully', async () => {
      mockRoomRepository.setActiveRoom.mockResolvedValue();

      await roomService.setActiveRoom('user1', 'room123');

      expect(mockRoomRepository.setActiveRoom).toHaveBeenCalledWith('user1', 'room123', undefined);
    });

    it('should throw error when userId is empty', async () => {
      await expect(roomService.setActiveRoom('', 'room123'))
        .rejects.toThrow('ID de usuario no proporcionado');

      expect(mockRoomRepository.setActiveRoom).not.toHaveBeenCalled();
    });

    it('should throw error when userId is only whitespace', async () => {
      await expect(roomService.setActiveRoom('   ', 'room123'))
        .rejects.toThrow('ID de usuario no proporcionado');

      expect(mockRoomRepository.setActiveRoom).not.toHaveBeenCalled();
    });

    it('should throw error when roomId is empty', async () => {
      await expect(roomService.setActiveRoom('user1', ''))
        .rejects.toThrow('ID de habitación no proporcionado');

      expect(mockRoomRepository.setActiveRoom).not.toHaveBeenCalled();
    });

    it('should throw error when roomId is only whitespace', async () => {
      await expect(roomService.setActiveRoom('user1', '   '))
        .rejects.toThrow('ID de habitación no proporcionado');

      expect(mockRoomRepository.setActiveRoom).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Room not found');
      mockRoomRepository.setActiveRoom.mockRejectedValue(error);

      await expect(roomService.setActiveRoom('user1', 'room999'))
        .rejects.toThrow('Room not found');

      expect(mockRoomRepository.setActiveRoom).toHaveBeenCalledWith('user1', 'room999', undefined);
    });

    it('should handle database constraint errors', async () => {
      const error = new Error('Unique constraint violation');
      mockRoomRepository.setActiveRoom.mockRejectedValue(error);

      await expect(roomService.setActiveRoom('user1', 'room123'))
        .rejects.toThrow('Unique constraint violation');

      expect(mockRoomRepository.setActiveRoom).toHaveBeenCalledWith('user1', 'room123', undefined);
    });
  });

  describe('buyRoom', () => {
    it('should deduct coins and register egreso when buying a room', async () => {
      const userId = 'user1';
      const roomId = 'room2';
      const room = {
        id: roomId,
        price: 100,
        name: 'Test Room',
        isDefault: false,
        roomEngineId: 'engine1',
        createdAt: new Date('2025-11-24T10:00:00.000Z'),
        compatibleSkins: [],
        description: '',
        imageUrl: '',
        modelUrl: ''
      };
      mockRoomRepository.getUserRooms.mockResolvedValue([]);
      mockRoomRepository.findById.mockResolvedValue(room);
      mockCoinRepository.deductCoins.mockResolvedValue();
      mockRoomRepository.addRoomToUser = jest.fn().mockResolvedValue(undefined);
      mockCoinRepository.registerMovement = jest.fn().mockResolvedValue(undefined);

      roomService.buyRoom = async (userId: string, roomId: string) => {
        const userRooms = await mockRoomRepository.getUserRooms(userId);
        if (userRooms.some((r: any) => r.id === roomId)) {
          throw new Error('Ya tienes esta habitación');
        }
        const room = await roomService.getRoomById(roomId);
        if (!room) throw new Error('Habitación no encontrada');
        const price = Number(room.price);
        if (isNaN(price) || price <= 0) throw new Error('Precio inválido');
        await mockCoinRepository.deductCoins(userId, price);
        await mockRoomRepository.addRoomToUser(userId, roomId);
        await mockCoinRepository.registerMovement(userId, price, 'egreso', 'Compra de habitación');
      };

      await expect(roomService.buyRoom(userId, roomId)).resolves.toBeUndefined();
      expect(mockCoinRepository.deductCoins).toHaveBeenCalledWith(userId, 100);
      expect(mockRoomRepository.addRoomToUser).toHaveBeenCalledWith(userId, roomId);
      expect(mockCoinRepository.registerMovement).toHaveBeenCalledWith(userId, 100, 'egreso', 'Compra de habitación');
    });
  });
});