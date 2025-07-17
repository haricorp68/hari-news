import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { BasePost } from './base-post.entity';
import { Category } from '../../category/entities/category.entity';
import { NewsTag } from './news_tag.entity';

@Entity()
export abstract class BaseNewsPost extends BasePost {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => NewsTag, (tag) => tag.posts, { cascade: true })
  @JoinTable()
  tags?: NewsTag[];
}
