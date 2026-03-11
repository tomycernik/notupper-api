import { IsString, IsEmail, IsOptional, IsEnum, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterUserDTO {
  @IsString() @IsNotEmpty() nombre!: string;
  @IsString() @IsNotEmpty() apellido!: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsNotEmpty() celular!: string;
  @IsString() @IsNotEmpty() zona!: string;
  @IsString() @MinLength(6) password!: string;
}

export class LoginDTO {
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}

export class UpdateUserDTO {
  @IsString() @IsOptional() nombre?: string;
  @IsString() @IsOptional() apellido?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() celular?: string;
  @IsString() @IsOptional() zona?: string;
}
