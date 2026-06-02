import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { DataSource } from 'typeorm';
import { Mandadero } from '../../entities/mandadero.entity';
import { User } from 'src/module/users/entities/user.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { CreateMandaderoAdminDto } from '../../dto/dto-solicitud/create-mandadero-admin.dto';
import { deleteFile } from 'src/common/helper/removeOldImage.helper';
import { MandaderoStatusService } from '../mandadero-status.service';

@Injectable()
export class MandaderoAdminService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly mandaderoStatusService: MandaderoStatusService,
  ) {}

  async create(
    dto: CreateMandaderoAdminDto,
    files: {
      imageIdentification?: Express.Multer.File[];
      circulationImage?: Express.Multer.File[];
      insuranceImage?: Express.Multer.File[];
    },
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const imageIdentification = files?.imageIdentification?.[0];
    const circulation = files?.circulationImage?.[0];
    const insurance = files?.insuranceImage?.[0];

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: dto.userId },
        relations: ['userRoles', 'userRoles.role'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const alreadyMandadero = await queryRunner.manager.findOne(Mandadero, {
        where: { user: { id: dto.userId } },
      });
      if (alreadyMandadero) {
        throw new ConflictException('Este usuario ya es mandadero');
      }
      const mandadero = queryRunner.manager.create(Mandadero, {
        user,
        available: false,
        isActive: true,
        status: ApprovalStatus.APPROVED,
        imageIdentification: imageIdentification?.filename,
      });
      const savedMandadero = await queryRunner.manager.save(mandadero);
      await this.mandaderoStatusService.assignMandaderoRole(
        savedMandadero,
        queryRunner.manager,
      );
      const plate = dto.licensePlate.trim().replace(/\s+/g, '').toUpperCase();

      const exists = await queryRunner.manager.findOne(Motorcycle, {
        where: { licensePlate: plate },
      });
      if (exists) {
        throw new ConflictException('Esta placa ya esta registrada');
      }

      const motorcycle = queryRunner.manager.create(Motorcycle, {
        brand: dto.brand,
        model: dto.model,
        color: dto.color,
        licensePlate: plate,
        circulationImage: circulation?.filename,
        insuranceImage: insurance?.filename,
        status: ApprovalStatus.APPROVED,
        mandadero: savedMandadero,
      });
      await queryRunner.manager.save(motorcycle);
      await queryRunner.commitTransaction();
      return {
        message: 'Mandadero created by admin successfully',
        mandadero: savedMandadero.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      const cleanupFiles = [
        { file: imageIdentification, folder: 'mandaderos' },
        { file: circulation, folder: 'motorcycles' },
        { file: insurance, folder: 'motorcycles' },
      ];

      cleanupFiles.forEach(({ file, folder }) => {
        if (file?.filename) deleteFile(file.filename, folder);
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
