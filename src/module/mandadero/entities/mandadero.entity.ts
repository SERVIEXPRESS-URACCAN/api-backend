import { User } from 'src/module/users/entities/user.entity';
import { Motorcycle } from 'src/module/motorcycles/entities/motorcycle.entity';
import { ApprovalStatus } from 'src/common/enum/approval-status.enum';
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
export class Mandadero {
  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: false })
  available: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => User, (user) => user.mandadero)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToOne(() => Motorcycle, (motorcycle) => motorcycle.mandadero)
  motorcycle: Motorcycle;

  @Column({ nullable: true })
  imageIdentification?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
