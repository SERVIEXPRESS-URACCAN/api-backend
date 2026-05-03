import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CartEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
  userId: number;
  business: number;
  // status: string;
  createdAt: Date;
}
