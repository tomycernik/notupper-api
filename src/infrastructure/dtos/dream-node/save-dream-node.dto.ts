import { IsString, IsNotEmpty, Length, IsIn, IsOptional } from 'class-validator';

export class SaveDreamNodeRequestDto {
  @IsString({ message: 'El título debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @Length(3, 100, { message: 'El título debe tener entre 3 y 100 caracteres.' })
  title!: string;

  @IsString({ message: 'La descripción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  @Length(10, 2000, { message: 'La descripción debe tener entre 10 y 2000 caracteres.' })
  description!: string;

  @IsString({ message: 'La interpretación debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La interpretación no puede estar vacía.' })
  @Length(10, 5000, { message: 'La interpretación debe tener entre 10 y 5000 caracteres.' })
  interpretation!: string;

  @IsString({ message: 'La emoción debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'La emoción no puede estar vacía.' })
  @IsIn(
    ['Frustracion', 'Tristeza', 'Verguenza', 'Enojo', 'Sorpresa', 'Miedo', 'Alegria', 'Celos', 'Nostalgia', 'Confusion'],
    {
      message:
        'La emoción debe ser una de las siguientes: Frustracion, Tristeza, Verguenza, Enojo, Sorpresa, Miedo, Alegria, Celos, Nostalgia, Confusion'
    }
  )
  emotion!: string;


  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena válida.' })
  imageUrl?: string;
  @IsString({ message: 'El tipo debe ser una cadena válida.' })
  @IsNotEmpty({ message: 'El tipo no puede estar vacío.' })
  @IsIn(
    ['Recurrente', 'Vivido', 'Pesadilla', 'Premonitorio', 'Lucido', 'Estandar'],
    {
      message:
        'El tipo debe ser uno de los siguientes: Recurrente, Vivido, Pesadilla, Premonitorio, Lucido o Estandar',
    },
  )
  dreamType!: string;
}