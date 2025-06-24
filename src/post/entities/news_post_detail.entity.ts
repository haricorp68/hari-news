import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class NewsPostDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_type: string; // 'user', 'community', 'company'

  @Column()
  post_id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  cover_image: string;
}
