import { MotorcycleBrand } from 'src/module/motorcycle-brand/entities/motorcycle-brand.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('motorcycle_model')
export class MotorcycleModel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  name: string;

  @ManyToOne(() => MotorcycleBrand, (brand) => brand.models)
  @JoinColumn({ name: 'brand_id', referencedColumnName: 'id' })
  brand: MotorcycleBrand;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
