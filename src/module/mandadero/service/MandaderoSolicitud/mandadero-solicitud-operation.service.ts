import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

import { Mandadero } from '../../entities/mandadero.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { User } from 'src/module/users/entities/user.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { MandaderoPolicyService } from '../mandadero-policy.service';

type OldFile = {
  filename: string;
  folder: 'mandaderos' | 'motorcycles';
};

@Injectable()
export class MandaderoSolicitudOperationsService {
  constructor(
    private readonly mandaderoPolicyService: MandaderoPolicyService,
  ) {}

  async saveApplication(
    queryRunner: QueryRunner,
    user: User,
    plate: string,
    brand: string,
    model: string,
    color: string,
    imageIdentification: Express.Multer.File,
    circulation: Express.Multer.File,
    insurance: Express.Multer.File,
  ) {
    const mandaderoExisting = user.mandadero;

    if (this.mandaderoPolicyService.canRetryApplication(user)) {
      if (!mandaderoExisting?.motorcycle) {
        throw new NotFoundException(
          'The rejected application has no associated motorcycle',
        );
      }

      const motorcycle = mandaderoExisting.motorcycle;

      const oldFiles: OldFile[] = [];

      if (
        mandaderoExisting.imageIdentification &&
        mandaderoExisting.imageIdentification !== imageIdentification.filename
      ) {
        oldFiles.push({
          filename: mandaderoExisting.imageIdentification,
          folder: 'mandaderos',
        });
      }

      if (
        motorcycle.circulationImage &&
        motorcycle.circulationImage !== circulation.filename
      ) {
        oldFiles.push({
          filename: motorcycle.circulationImage,
          folder: 'motorcycles',
        });
      }

      if (
        motorcycle.insuranceImage &&
        motorcycle.insuranceImage !== insurance.filename
      ) {
        oldFiles.push({
          filename: motorcycle.insuranceImage,
          folder: 'motorcycles',
        });
      }

      mandaderoExisting.status = ApprovalStatus.PENDING;
      mandaderoExisting.available = false;
      mandaderoExisting.isActive = false;
      mandaderoExisting.imageIdentification = imageIdentification.filename;

      motorcycle.licensePlate = plate;
      motorcycle.brand = brand;
      motorcycle.model = model;
      motorcycle.color = color;
      motorcycle.circulationImage = circulation.filename;
      motorcycle.insuranceImage = insurance.filename;
      motorcycle.status = ApprovalStatus.PENDING;

      const savedMandadero = await queryRunner.manager.save(mandaderoExisting);

      const savedMotorcycle = await queryRunner.manager.save(motorcycle);

      return {
        savedMandadero,
        savedMotorcycle,
        isRetrying: true,
        oldFiles,
      };
    }

    const mandadero = queryRunner.manager.create(
      Mandadero,
      this.mandaderoPolicyService.buildNewMandadero(
        user,
        imageIdentification.filename,
      ),
    );

    const savedMandadero = await queryRunner.manager.save(mandadero);

    const motorcycle = queryRunner.manager.create(Motorcycle, {
      licensePlate: plate,
      brand: brand,
      model: model,
      color: color,
      circulationImage: circulation.filename,
      insuranceImage: insurance.filename,
      status: ApprovalStatus.PENDING,
      mandadero: savedMandadero,
    });

    const savedMotorcycle = await queryRunner.manager.save(motorcycle);

    return {
      savedMandadero,
      savedMotorcycle,
      isRetrying: false,
      oldFiles: [] as OldFile[],
    };
  }
}
