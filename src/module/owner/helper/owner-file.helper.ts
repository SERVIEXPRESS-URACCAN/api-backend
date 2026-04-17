import { Owner } from '../entities/owner.entity';
import { validateImage } from './file.helper';

export function processImage(
  owner: Owner,
  file: Express.Multer.File | undefined,
  field: 'profileImage' | 'identificationCardImage',
  removeFile: (filename: string) => void,
) {
  if (!file) return;

  validateImage(file, field);

  const oldFile = owner[field];

  if (oldFile) {
    removeFile(oldFile);
  }

  owner[field] = file.filename;
}
