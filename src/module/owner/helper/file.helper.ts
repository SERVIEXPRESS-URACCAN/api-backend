import { BadRequestException } from '@nestjs/common';

export function validateImage(file: Express.Multer.File, field: string) {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    throw new BadRequestException(`Formato inválido en ${field}`);
  }
}
