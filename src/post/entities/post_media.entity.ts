import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { MediaType } from '../enums/post.enums';

@Entity()
export class PostMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_type: string; // 'user_feed', 'community_feed', 'company_feed', 'user_news', 'community_news', 'company_news'

  @Column()
  post_id: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType; // 'image', 'video'

  @Column()
  order: number;
}
