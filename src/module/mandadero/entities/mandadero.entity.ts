import { User } from 'src/module/users/entities/user.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class Mandadero {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: false })
  available: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => User, (user) => user.mandadero)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToOne(() => Motorcycle, (motorcycle) => motorcycle.mandadero, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'motorcycle_id' })
  motorcycle: Motorcycle;

  @DeleteDateColumn()
  deletedAt: Date;

  @Column({ nullable: false })
  imageIdentification: string;
}
