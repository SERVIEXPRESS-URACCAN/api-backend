import { deleteFile } from './removeOldImage.helper';

export function updateImage(
  newFile: Express.Multer.File | undefined,
  currentFileName?: string,
  folder?: string,
): string {
  if (!newFile) return currentFileName ?? '';

  if (currentFileName && folder) {
    deleteFile(currentFileName, folder);
  }

  return newFile.filename;
}
