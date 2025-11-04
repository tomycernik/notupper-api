import { RoomResponseDto } from '@infrastructure/dtos/room/get-user-rooms.dto';
import { SkinResponseDto } from '@infrastructure/dtos/skin/get-user-skins.dto';

export interface UserAssetsResponseDto {
  rooms: RoomResponseDto[];
  skins: SkinResponseDto[];
}
