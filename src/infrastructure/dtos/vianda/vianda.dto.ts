import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateViandaDTO {
  @IsString() @IsNotEmpty() nombre!: string;
  @IsEnum(['COMUN', 'VEGETARIANA']) tipo!: 'COMUN' | 'VEGETARIANA';
  @IsBoolean() @IsOptional() activo?: boolean;
  @IsString() @IsOptional() observaciones?: string;
}

export class UpdateViandaDTO {
  @IsString() @IsOptional() nombre?: string;
  @IsEnum(['COMUN', 'VEGETARIANA']) @IsOptional() tipo?: 'COMUN' | 'VEGETARIANA';
  @IsBoolean() @IsOptional() activo?: boolean;
  @IsString() @IsOptional() observaciones?: string;
}

class ComidaOrdenDTO {
  @IsUUID() comidaId!: string;
  @IsNumber() @IsOptional() orden?: number;
}

export class AsignarComidasDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComidaOrdenDTO)
  comidas!: ComidaOrdenDTO[];
}