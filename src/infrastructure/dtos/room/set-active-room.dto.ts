import { IsNotEmpty, IsString } from 'class-validator';

export class SetActiveRoomDto {
  @IsNotEmpty({ message: 'El roomId es requerido' })
  @IsString({ message: 'El roomId debe ser un string' })
  roomId!: string;
}
