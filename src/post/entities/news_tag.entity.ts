import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { UserNewsPost } from './user_news_post.entity';

@Entity()
export class NewsTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => UserNewsPost, (post) => post.tags)
  posts: UserNewsPost[];
}
