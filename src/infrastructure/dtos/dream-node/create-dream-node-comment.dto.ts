import { IsString, MinLength } from 'class-validator';

export class CreateDreamNodeCommentDto {
  @IsString({ message: 'El comentario debe ser texto' })
  @MinLength(1, { message: 'El comentario no puede estar vacío' })
  content!: string;
}
