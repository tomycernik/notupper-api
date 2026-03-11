import { IsUUID, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreatePedidoDTO {
  @IsUUID() vianda_id!: string;
  @IsEnum(['CHICA', 'GRANDE']) tamano!: 'CHICA' | 'GRANDE';
  @IsString() @IsOptional() observaciones?: string;
}

export class UpdateEstadoDTO {
  @IsEnum(['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO']) estado!: 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';
}