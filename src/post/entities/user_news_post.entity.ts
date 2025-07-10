import { Entity, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseNewsPost } from './base-news-post.entity';

@Entity()
export class UserNewsPost extends BaseNewsPost {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
} 