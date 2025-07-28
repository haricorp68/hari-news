import { Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BaseNewsPost } from './base-news-post.entity';
import { NewsTag } from './news_tag.entity';

@Entity()
export class UserNewsPost extends BaseNewsPost {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
  @ManyToMany(() => NewsTag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags?: NewsTag[];
}
