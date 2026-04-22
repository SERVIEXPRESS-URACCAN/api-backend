import { CategoriesBusiness } from 'src/module/categories-business/entities/categories-business.entity';
import { City } from 'src/module/city/entities/city.entity';
import { Owner } from 'src/module/owner/entities/owner.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
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

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @ManyToOne(() => City, { eager: true })
  @JoinColumn({ name: 'city_id', referencedColumnName: 'id' })
  city: City;

  @Column({ type: 'varchar', nullable: true })
  address?: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  logoImage?: string;

  @Column({ type: 'varchar', nullable: true })
  bannerImage?: string;

  @OneToOne(() => Owner, { eager: true })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id' })
  owner: Owner;

  @ManyToMany(() => CategoriesBusiness, (category) => category.businesses, {
    eager: true,
  })
  @JoinTable()
  categories: CategoriesBusiness[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
