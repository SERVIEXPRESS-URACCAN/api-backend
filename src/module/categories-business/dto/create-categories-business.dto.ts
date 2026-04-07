<<<<<<< HEAD
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriesBusinessDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
=======
export class CreateCategoriesBusinessDto {}
>>>>>>> 278deea (feat: add categories business module with controller, service, and DTOs)
