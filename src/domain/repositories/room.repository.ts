import { Room } from '../interfaces/room.interface';

export interface IRoomRepository {
  getUserRooms(userId: string): Promise<Room[]>;
  getDefaultRoom(): Promise<Room | null>;
  findById(roomId: string): Promise<Room | null>;
  create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room>;
  update(roomId: string, room: Partial<Room>): Promise<Room>;
  delete(roomId: string): Promise<void>;
  addCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  removeCompatibleSkin(roomId: string, skinId: string): Promise<Room>;
  getActiveRoom(userId: string): Promise<Room | null>;
  setActiveRoom(userId: string, roomId: string): Promise<void>;
}