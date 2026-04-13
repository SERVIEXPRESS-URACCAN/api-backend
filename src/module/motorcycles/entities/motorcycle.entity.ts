import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';

import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Motorcycle {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => Mandadero, (mandadero) => mandadero.motorcycle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'mandadero_id', referencedColumnName: 'id' })
  mandadero: Mandadero;

  @Column({ type: 'varchar', length: 50, nullable: false })
  brand: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  model: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  color: string;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  licensePlate: string;

  @Column({ type: 'varchar', nullable: true })
  circulationImage: string;

  @Column({ type: 'varchar', nullable: true })
  insuranceImage: string;
}
