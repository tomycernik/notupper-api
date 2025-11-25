import { IsNotEmpty, IsString } from "class-validator";

export class SaveImageRequestDto {
  @IsString()
  @IsNotEmpty({
    message: "El titulo de la imagen no puede estar vacio",
  })
  imageTitle!: string;

  @IsString()
  @IsNotEmpty({
    message: "La url de la imagen no puede estar vacia",
  })
  imageUrl!: string;

  @IsString()
  @IsNotEmpty({
    message: "El titulo de la miniatura no puede estar vacio",
  })
  thumbTitle!: string;

  @IsString()
  @IsNotEmpty({
    message: "La url de la miniatura no puede estar vacia",
  })
  thumbUrl!: string;
}
