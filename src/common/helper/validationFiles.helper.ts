import { BadRequestException } from '@nestjs/common';

export function validateFile(
  files: Record<string, Express.Multer.File | undefined>,
) {
  const missingFiles = Object.entries(files)
    .filter(([, file]) => !file)
    .map(([name]) => name);

  if (missingFiles.length > 0) {
    throw new BadRequestException(
      `Missing required files: ${missingFiles.join(', ')}`,
    );
  }

  const maxSize = 3 * 1024 * 1024;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

  for (const [name, file] of Object.entries(files)) {
    if (!file) continue;

    if (file.size > maxSize) {
      throw new BadRequestException(`${name} exceeds the maximum size of 3MB`);
    }

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Only JPEG, PNG, and JPG files are allowed for ${name}`,
      );
    }
  }
}
