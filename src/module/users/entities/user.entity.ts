import { Profile } from 'src/module/profie/entities/profile.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { Roles } from 'src/module/roles/entities/roles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoles } from 'src/module/user-roles/entities/user-roles.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @OneToOne(() => Owner, (owner) => owner.user)
  owner: Owner;

  @OneToOne(() => Mandadero, (mandadero) => mandadero.user)
  mandadero: Mandadero;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @Column({ default: true, type: 'boolean' })
  status: boolean;

  @ManyToOne(() => Roles, (role) => role.user, { eager: true })
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role: Roles;

  @OneToMany(() => UserRoles, (userrole) => userrole.user)
  userRoles: UserRoles[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true })
  deletedAt?: Date;
}
