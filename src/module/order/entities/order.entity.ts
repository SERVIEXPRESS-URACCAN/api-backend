import { Business } from 'src/module/business/entities/business.entity';
import { User } from 'src/module/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../enum/orderStatus';
// import { OrderItem } from 'src/module/order-items/entities/order-item.entity';

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

  // @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  // items: OrderItem[];

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
}
