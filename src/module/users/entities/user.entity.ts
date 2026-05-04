import { Cart } from 'src/module/cart/entities/cart.entity';
import { Mandadero } from 'src/module/mandadero/entities/mandadero.entity';
import { Order } from 'src/module/order/entities/order.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import { Profile } from 'src/module/profie/entities/profile.entity';
import { UserRole } from 'src/module/user-roles/entities/user-roles.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
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

  @OneToOne(() => Owner, (owner) => owner.user)
  owner: Owner;

  @OneToOne(() => Mandadero, (mandadero) => mandadero.user)
  mandadero: Mandadero;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @Column({ default: true, type: 'boolean' })
  status: boolean;

  @OneToMany(() => UserRole, (userrole) => userrole.user)
  userRoles: UserRole[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deletedAt', nullable: true })
  deletedAt?: Date;
}
