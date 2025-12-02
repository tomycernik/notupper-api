import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SetActiveRoomDto {
  @IsNotEmpty({ message: 'El roomId es requerido' })
  @IsString({ message: 'El roomId debe ser un string' })
  roomId!: string;

  @IsOptional()
  @IsString({ message: 'El skinId debe ser un string' })
  skinId?: string;
}
