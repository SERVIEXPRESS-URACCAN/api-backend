import { BadRequestException } from '@nestjs/common';

export function validateImage(
  file: Express.Multer.File | undefined,
  field: string,
) {
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(`Formato inválido en ${field}`);
  }
}
