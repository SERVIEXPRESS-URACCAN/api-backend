import { Business } from 'src/module/business/entities/business.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Business, (business) => business.products)
  business: Business;

  @ManyToOne(() => CategoriesProduct, (category) => category.products)
  category: CategoriesProduct;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
