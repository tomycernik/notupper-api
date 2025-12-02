import { Room } from '@domain/interfaces/room.interface';
import { IPaginatedResult, IPaginationOptions } from '@domain/interfaces/pagination.interface';

export interface IRoomRepository {
  getUserRooms(userId: string): Promise<Room[]>;
  getAllRooms(pagination?: IPaginationOptions): Promise<IPaginatedResult<Room>>;
  getDefaultRoom(): Promise<Room | null>;
  findById(roomId: string): Promise<Room | null>;
  addRoomToUser(userId: string, roomId: string): Promise<void>;
  create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room>;
  update(roomId: string, room: Partial<Room>): Promise<Room>;
  delete(roomId: string): Promise<void>;
  addCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  removeCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  getActiveRoom(userId: string): Promise<Room | null>;
  setActiveRoom(userId: string, roomId: string, skinId?: string): Promise<void>;
}