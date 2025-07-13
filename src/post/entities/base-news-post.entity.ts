import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BasePost } from './base-post.entity';
import { Category } from '../../category/entities/category.entity';

@Entity()
export abstract class BaseNewsPost extends BasePost {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
} 