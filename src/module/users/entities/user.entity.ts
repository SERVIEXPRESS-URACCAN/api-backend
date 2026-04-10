import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Profile } from 'src/module/profile/entities/profile.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToOne(() => Mandadero, (mandadero) => mandadero.user)
  mandadero: Mandadero;

  @Column({ default: true, type: 'boolean' })
  status: boolean;

  @ManyToOne(() => Roles, (role) => role.user, { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Roles;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
