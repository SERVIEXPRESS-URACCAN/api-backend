import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Mandadero } from '../../entities/mandadero.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { CreateMandaderoSolicitudDto } from '../../dto/dto-solicitud/create-solicitud.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { User } from 'src/module/users/entities/user.entity';

import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { deleteFile } from 'src/common/helper/removeOldImage.helper';
import { MandaderoPolicyService } from '../mandadero-policy.service';

@Injectable()
export class MandaderoSolicitudService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly mandaderoPolicyService: MandaderoPolicyService,
  ) {}

  async create(
    dto: CreateMandaderoSolicitudDto,
    files: {
      imageIdentification?: Express.Multer.File[];
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
    authUser: AuthUser,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const imageIdentification = files?.imageIdentification?.[0];
    const circulation = files?.circulationImage?.[0];
    const insurance = files?.insuranceImage?.[0];

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: authUser.id },
        relations: ['mandadero'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.mandaderoPolicyService.validateCreate(user);

      const mandadero = queryRunner.manager.create(
        Mandadero,
        this.mandaderoPolicyService.buildNewMandadero(
          user,
          imageIdentification!.filename,
        ),
      );

      const savedMandadero = await queryRunner.manager.save(mandadero);

      const plate = dto.licensePlate.trim().replace(/\s+/g, '').toUpperCase();
      const exists = await queryRunner.manager.findOne(Motorcycle, {
        where: { licensePlate: plate },
      });
      if (exists) {
        throw new ConflictException('License plate already registered');
      }

      const motorcycle = queryRunner.manager.create(Motorcycle, {
        licensePlate: plate,
        circulationImage: circulation!.filename,
        insuranceImage: insurance!.filename,
        status: ApprovalStatus.PENDING,
        mandadero: savedMandadero,
      });

      const savedMotorcycle = await queryRunner.manager.save(motorcycle);

      await queryRunner.commitTransaction();

      return {
        message: 'Solicitud creada correctamente',
        mandaderoId: savedMandadero.id,
        motorcycleId: savedMotorcycle.id,
        status: ApprovalStatus.PENDING,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const cleanupFiles = [
        { file: imageIdentification, folder: 'mandaderos' },
        { file: circulation, folder: 'motorcycles' },
        { file: insurance, folder: 'motorcycles' },
      ];

      cleanupFiles.forEach(({ file, folder }) => {
        if (file) deleteFile(file.filename, folder);
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
