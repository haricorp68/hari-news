import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class NewsPostBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_type: string; // 'user', 'community', 'company'

  @Column()
  post_id: number;

  @Column()
  type: string; // 'paragraph', 'image', 'video', 'quote', 'embed'

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  media_url: string;

  @Column()
  order: number;
}
