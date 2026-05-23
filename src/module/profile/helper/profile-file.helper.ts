import { validateImage } from 'src/module/business/helper/file.helper';
import { Profile } from '../entities/profile.entity';

export function processProfileImage(
  profile: Profile,
  file: Express.Multer.File | undefined,
  removeFile: (filename: string) => void,
) {
  if (!file) return;

  validateImage(file, 'image');

  const oldImage = profile.image;

  if (oldImage) {
    removeFile(oldImage);
  }

  profile.image = file.filename;
}
