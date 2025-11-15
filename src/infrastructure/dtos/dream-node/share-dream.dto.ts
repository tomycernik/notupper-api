import { IsNotEmpty, IsString } from "class-validator";

export class ShareDreamRequestDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}
