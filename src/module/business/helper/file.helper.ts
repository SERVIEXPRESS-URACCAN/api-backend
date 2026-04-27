import { BadRequestException } from '@nestjs/common';

export function validateImage(
  file: Express.Multer.File | undefined,
  field: string,
) {
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    throw new BadRequestException('La imagen muy pesada');
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(`Formato inválido en ${field}`);
  }
}
