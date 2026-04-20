import { BadRequestException } from '@nestjs/common';

export type UploadedFile = {
  path: string;
  mimetype: string;
  size: number;
};
export function validateFile(file?: UploadedFile, name = 'file') {
  if (!file) return;

  const maxSize = 3 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (file.size > maxSize) {
    throw new BadRequestException(`${name} exceeds the maximum size of 3MB`);
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      `Only JPEG, PNG, and JPG files are allowed for ${name}`,
    );
  }
}
