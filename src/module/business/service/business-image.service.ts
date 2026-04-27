import { Injectable } from '@nestjs/common';
import { Business } from '../entities/business.entity';
import { FileService } from '../service/file.service';

@Injectable()
export class BusinessImageService {
  constructor(private readonly fileService: FileService) {}

  handleImages(
    business: Business,
    files?: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    },
  ) {
    const logoImage = files?.logoImage?.[0];
    const bannerImage = files?.bannerImage?.[0];

    if (logoImage) {
      this.fileService.validateImage(logoImage, 'logoImage');
    }

    if (bannerImage) {
      this.fileService.validateImage(bannerImage, 'bannerImage');
    }

    this.fileService.processImage(
      business,
      logoImage,
      'logoImage',
      this.fileService.removeFile.bind(this.fileService),
    );

    this.fileService.processImage(
      business,
      bannerImage,
      'bannerImage',
      this.fileService.removeFile.bind(this.fileService),
    );
  }

  cleanupOnError(files?: {
    logoImage?: Express.Multer.File[];
    bannerImage?: Express.Multer.File[];
  }) {
    const logoImage = files?.logoImage?.[0];
    const bannerImage = files?.bannerImage?.[0];

    if (logoImage) this.fileService.removeFile(logoImage.filename);
    if (bannerImage) this.fileService.removeFile(bannerImage.filename);
  }

  removeBusinessImages(business: Business) {
    if (business.logoImage) {
      this.fileService.removeFile(business.logoImage);
    }

    if (business.bannerImage) {
      this.fileService.removeFile(business.bannerImage);
    }
  }
}
