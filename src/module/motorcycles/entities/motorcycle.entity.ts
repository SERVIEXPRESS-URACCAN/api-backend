import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Motorcycle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @OneToOne(() => Mandadero, (mandadero) => mandadero.motorcycle)
  @JoinColumn({ name: 'mandadero_id', referencedColumnName: 'id' })
  mandadero: Mandadero;

  @Column({ type: 'varchar', length: 20, nullable: true })
  brand?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  model?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  color?: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  licensePlate: string;

  @Column({ type: 'varchar', nullable: false })
  circulationImage: string;

  @Column({ type: 'varchar', nullable: false })
  insuranceImage: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
