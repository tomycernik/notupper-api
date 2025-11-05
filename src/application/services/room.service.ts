import { Room } from '@domain/interfaces/room.interface';
import { GetUserRoomsResponseDto, RoomResponseDto } from '@infrastructure/dtos/room/get-user-rooms.dto';
import { IRoomRepository } from '@domain/repositories/room.repository';
import { IPaginatedResult, IPaginationOptions } from '@domain/interfaces/pagination.interface';

export class RoomService {
  constructor(private readonly roomRepository: IRoomRepository) { }

  async getAllRooms(pagination?: IPaginationOptions): Promise<IPaginatedResult<RoomResponseDto>> {
    try {
      const result = await this.roomRepository.getAllRooms(pagination);
      return {
        data: this.mapToResponseDto(result.data),
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error al obtener todas las habitaciones:', error);
      throw error;
    }
  }

  async getUserRooms(userId: string): Promise<GetUserRoomsResponseDto> {
    if (!userId) {
      return {
        success: false,
        data: [],
        message: 'ID de usuario no proporcionado'
      };
    }

    try {
      const rooms = await this.roomRepository.getUserRooms(userId);
      const mappedRooms = this.mapToResponseDto(rooms);
      return {
        success: true,
        data: mappedRooms
      };
    } catch (error) {
      console.error('Error al obtener las habitaciones del usuario:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error al obtener las habitaciones del usuario'
      };
    }
  }

  async getDefaultRoom(): Promise<Room | null> {
    try {
      return await this.roomRepository.getDefaultRoom();
    } catch (error) {
      console.error('Error al obtener las habitaciones por defecto:', error);
      return null;
    }
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    try {
      return await this.roomRepository.findById(roomId);
    } catch (error) {
      console.error('Error al obtener la habitación:', error);
      return null;
    }
  }

  async addRoomToUser(userId: string, roomId: string): Promise<void> {
    if (!userId || !roomId) {
      throw new Error('ID de usuario y habitación son requeridos');
    }

    try {
      await this.roomRepository.addRoomToUser(userId, roomId);
    } catch (error) {
      console.error('Error al agregar habitación al usuario:', error);
      throw error;
    }
  }

  async createRoom(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
    return await this.roomRepository.create(room);
  }

  async updateRoom(roomId: string, room: Partial<Room>): Promise<Room> {
    const existingRoom = await this.getRoomById(roomId);
    if (!existingRoom) {
      throw new Error('Habitación no encontrada');
    }

    if (room.name !== undefined && room.name.trim() === '') {
      throw new Error('El nombre de la room no puede estar vacío');
    }
    if (room.price !== undefined && room.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }

    return await this.roomRepository.update(roomId, room);
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      await this.roomRepository.delete(roomId);
      return true;
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      return false;
    }
  }

  async addCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    return await this.roomRepository.addCompatibleSkin(roomId, skinId);
  }

  async removeCompatibleSkin(roomId: string, skinId: string): Promise<Room> {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('Habitación no encontrada');
    }

    return await this.roomRepository.removeCompatibleSkin(roomId, skinId);
  }

  async getActiveRoom(userId: string): Promise<Room | null> {
    if (!userId || userId.trim() === '') {
      throw new Error('ID de usuario no proporcionado');
    }

    try {
      return await this.roomRepository.getActiveRoom(userId);
    } catch (error) {
      console.error('Error al obtener la habitación activa:', error);
      return null;
    }
  }

  async setActiveRoom(userId: string, roomId: string): Promise<void> {
    if (!userId?.trim()) {
      throw new Error('ID de usuario no proporcionado');
    }
    if (!roomId?.trim()) {
      throw new Error('ID de habitación no proporcionado');
    }

    try {
      await this.roomRepository.setActiveRoom(userId, roomId);
    } catch (error: any) {
      console.error('Error setting active room:', error);
      throw error;
    }
  }

  private mapToResponseDto(rooms: Room[]): RoomResponseDto[] {
    return rooms.map((room) => {
      const response: RoomResponseDto = {
        id: room.id,
        name: room.name,
        price: room.price ? { amount: room.price, currency: 'coins' } : null,
        active: room.active || false,
        compatible_textures: room.compatibleSkins || [],
        created_at: room.createdAt.toString(),
        room_engine_id: room.roomEngineId,
        texture_applied: room.textureApplied || null,
        texture_default: room.defaultTexture || null
      };

      if (room.description) response.description = room.description;
      if (room.imageUrl) response.image_url = room.imageUrl;
      if (room.modelUrl) response.model_url = room.modelUrl;
      if (room.includedInPlan) response.included_in_plan = room.includedInPlan;

      return response;
    });
  }
}