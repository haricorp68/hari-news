import { Entity, Column } from 'typeorm';
import { BasePost } from './base-post.entity';

@Entity()
export abstract class BaseNewsPost extends BasePost {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  cover_image: string;
} 