import * as fs from 'fs';
import * as path from 'path';

export function deleteFile(filePath?: string) {
  if (!filePath) return;

  const fullPath = path.join(process.cwd(), filePath);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}
