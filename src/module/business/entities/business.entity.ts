import { CategoriesBusiness } from 'src/module/categories-business/entities/categories-business.entity';
import { User } from 'src/module/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Business {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'int4', nullable: false })
  city: number;

  @ManyToMany(() => CategoriesBusiness, (category) => category.businesses)
  @JoinTable()
  businessCategories: CategoriesBusiness[];

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  phone: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
  // days_open: string;
  // opening_time: string;
  // closing_time: string;
  // logo_image: string;
  // banner_image: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
