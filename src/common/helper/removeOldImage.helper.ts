import * as fs from 'fs';
import * as path from 'path';

export function deleteFile(fileName?: string, folder = '') {
  if (!fileName) return;

  const fullPath = path.join(process.cwd(), 'uploads', folder, fileName);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
