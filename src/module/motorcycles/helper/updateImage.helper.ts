import { UploadedFile } from './validationFiles.helper';
import { deleteFile } from './removeOldImage.helper';

export function updateImage(
  newFile: UploadedFile | undefined,
  currentPath: string,
): string {
  if (!newFile) return currentPath;

  deleteFile(currentPath);

  return newFile.path;
}
