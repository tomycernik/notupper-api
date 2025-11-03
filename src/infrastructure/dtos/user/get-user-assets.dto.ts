import { RoomResponseDto } from '../room/get-user-rooms.dto';
import { SkinResponseDto } from '../skin/get-user-skins.dto';

export interface UserAssetsResponseDto {
  rooms: RoomResponseDto[];
  skins: SkinResponseDto[];
}
