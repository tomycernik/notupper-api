import { IsUUID, IsOptional, IsString, IsEnum, IsArray, ValidateNested, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class ExtraDTO {
  @IsIn(['empanada', 'pizza']) tipo!: 'empanada' | 'pizza';
  @IsString() sabor!: string;
  @IsNumber() cantidad!: number;
}

export class CreatePedidoDTO {
  @IsUUID() @IsOptional() vianda_id?: string;
  @IsEnum(['CHICA', 'GRANDE']) @IsOptional() tamano?: 'CHICA' | 'GRANDE';
  @IsString() @IsOptional() observaciones?: string;
  @IsArray() @IsOptional() @ValidateNested({ each: true }) @Type(() => ExtraDTO)
  extras?: ExtraDTO[];
}

export class UpdateEstadoDTO {
  @IsEnum(['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO']) estado!: 'PENDIENTE' | 'EN_PROCESO' | 'ENTREGADO' | 'CANCELADO';
}