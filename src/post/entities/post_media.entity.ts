import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PostMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_type: string; // 'user', 'community', 'company'

  @Column()
  post_id: number;

  @Column()
  url: string;

  @Column()
  type: string; // 'image', 'video'

  @Column()
  order: number;
}
