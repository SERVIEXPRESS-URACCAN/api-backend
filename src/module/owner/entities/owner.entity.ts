import { Business } from 'src/module/business/entities/business.entity';
import { User } from 'src/module/users/entities/user.entity';
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
export class Owner {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @OneToOne(() => User, (user) => user.owner)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToOne(() => Business, (business) => business.owner)
  business: Business;

  @Column({ type: 'varchar', nullable: false })
  razonSocial: string;

  @Column({ nullable: false })
  identificationCardImage: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
