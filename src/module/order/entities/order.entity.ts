import { Business } from 'src/module/business/entities/business.entity';
import { OrderItem } from 'src/module/order-items/entities/order-item.entity';
import { User } from 'src/module/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeliveryStatus, OrderStatus } from '../enum/orderStatus';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  businessId: number;

  @ManyToOne(() => Business, (business) => business.orders)
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.WAITING,
  })
  deliveryStatus: DeliveryStatus;

  @Column({ nullable: true })
  mandaderoId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'mandaderoId' })
  mandadero?: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;
}
