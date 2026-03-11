import { IsString, IsEnum, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateComidaDTO {
  @IsString() @IsNotEmpty() nombre!: string;
  @IsString() @IsOptional() descripcion?: string;
  @IsEnum(['COMUN', 'VEGETARIANA', 'AMBAS']) tipo!: 'COMUN' | 'VEGETARIANA' | 'AMBAS';
  @IsBoolean() @IsOptional() activa?: boolean;
}

export class UpdateComidaDTO {
  @IsString() @IsOptional() nombre?: string;
  @IsString() @IsOptional() descripcion?: string;
  @IsEnum(['COMUN', 'VEGETARIANA', 'AMBAS']) @IsOptional() tipo?: 'COMUN' | 'VEGETARIANA' | 'AMBAS';
  @IsBoolean() @IsOptional() activa?: boolean;
}