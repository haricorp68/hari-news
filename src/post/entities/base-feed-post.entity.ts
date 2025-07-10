import { Entity, Column } from 'typeorm';
import { BasePost } from './base-post.entity';
 
@Entity()
export abstract class BaseFeedPost extends BasePost {
  @Column({ type: 'text', nullable: true })
  caption: string;
} 