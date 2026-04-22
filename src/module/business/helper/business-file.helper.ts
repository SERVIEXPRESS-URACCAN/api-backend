import { Business } from '../entities/business.entity';
import { validateImage } from './file.helper';

export function processImage(
  business: Business,
  file: Express.Multer.File | undefined,
  field: 'logoImage' | 'bannerImage',
  removeFile: (filename: string) => void,
) {
  if (!file) return;

  validateImage(file, field);

  const oldFile = business[field];

  if (oldFile) {
    removeFile(oldFile);
  }

  business[field] = file.filename;
}
