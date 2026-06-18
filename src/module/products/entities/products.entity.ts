import { Business } from 'src/module/business/entities/business.entity';
import { CategoriesProduct } from 'src/module/categories-products/entities/categories-product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => CategoriesProduct, (category) => category.products)
  @JoinTable()
  categories: CategoriesProduct[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
