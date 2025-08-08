import { Entity, ManyToOne, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseFeedPost } from './base-feed-post.entity';

@Entity()
export class UserFeedPost extends BaseFeedPost {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
