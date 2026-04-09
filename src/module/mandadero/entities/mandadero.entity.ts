import { User } from 'src/module/users/entities/user.entity';
import {
  Column,
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

  //   @Column({ nullable: false })
  //   imageIdentification: string;
}
