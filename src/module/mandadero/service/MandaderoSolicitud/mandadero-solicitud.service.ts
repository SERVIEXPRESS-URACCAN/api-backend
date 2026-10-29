import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { CreateMandaderoSolicitudDto } from '../../dto/dto-solicitud/create-solicitud.dto';
import { AuthUser } from 'src/module/auth/interfaces/auth-user.interface';
import { User } from 'src/module/users/entities/user.entity';

import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { deleteFile } from 'src/common/helper/removeOldImage.helper';
import { MandaderoPolicyService } from '../mandadero-policy.service';
import { MandaderoSolicitudOperationsService } from './mandadero-solicitud-operation.service';
import { Mandadero } from '../../entities/mandadero.entity';
@Injectable()
export class MandaderoSolicitudService {
  constructor(
    private readonly dataSource: DataSource,

    private readonly mandaderoPolicyService: MandaderoPolicyService,

    private readonly mandaderoSolicitudOperationsService: MandaderoSolicitudOperationsService,
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
    let transactionCommitted = false;

    try {
      if (!imageIdentification || !circulation || !insurance) {
        const missingFiles = [
          !imageIdentification && 'imageIdentification',
          !circulation && 'circulationImage',
          !insurance && 'insuranceImage',
        ].filter(Boolean);

        throw new BadRequestException(
          `Missing required files: ${missingFiles.join(', ')}`,
        );
      }

      const user = await queryRunner.manager.findOne(User, {
        where: { id: authUser.id },
        relations: ['mandadero', 'mandadero.motorcycle'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      this.mandaderoPolicyService.validateCreate(user);

      const plate = dto.licensePlate.trim().replace(/\s+/g, '').toUpperCase();

      const mandaderoExists = user.mandadero;
      const exists = await queryRunner.manager.findOne(Motorcycle, {
        where: { licensePlate: plate },
      });
      if (exists && exists.id !== mandaderoExists?.motorcycle?.id) {
        throw new ConflictException('License plate already registered');
      }

      const result =
        await this.mandaderoSolicitudOperationsService.saveApplication(
          queryRunner,
          user,
          plate,
          dto.brand,
          dto.model,
          dto.color,
          imageIdentification,
          circulation,
          insurance,
        );
      const { savedMandadero, savedMotorcycle, oldFiles } = result;

      await queryRunner.commitTransaction();
      transactionCommitted = true;

      oldFiles.forEach(({ filename, folder }) => {
        deleteFile(filename, folder);
      });
      return {
        message: result.isRetrying
          ? 'Solicitud reenviada correctamente'
          : 'Solicitud creada correctamente',
        mandaderoId: savedMandadero.id,
        motorcycleId: savedMotorcycle.id,
        status: ApprovalStatus.PENDING,
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (!transactionCommitted) {
        const cleanupFiles = [
          { file: imageIdentification, folder: 'mandaderos' },
          { file: circulation, folder: 'motorcycles' },
          { file: insurance, folder: 'motorcycles' },
        ];

        cleanupFiles.forEach(({ file, folder }) => {
          if (file?.filename) {
            deleteFile(file.filename, folder);
          }
        });
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findMySolicitud(authUser: AuthUser) {
    const mandadero = await this.dataSource.getRepository(Mandadero).findOne({
      where: {
        user: { id: authUser.id },
      },
      relations: {
        motorcycle: true,
      },
    });

    if (!mandadero) {
      return null;
    }

    return {
      id: mandadero.id,
      status: mandadero.status,
      isActive: mandadero.isActive,
      motorcycle: mandadero.motorcycle
        ? {
            licensePlate: mandadero.motorcycle.licensePlate,
            brand: mandadero.motorcycle.brand,
            model: mandadero.motorcycle.model,
            color: mandadero.motorcycle.color,
          }
        : null,
    };
  }
}
