import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { processImage } from '../helper/business-file.helper';
import { validateImage } from '../helper/file.helper';

@Injectable()
export class FileService {
  validateImage = validateImage;
  processImage = processImage;

  removeFile(filename: string) {
    const filePath = path.join('./uploads/business', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
