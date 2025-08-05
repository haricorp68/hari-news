import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
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

  @Column({ unique: true })
  slug: string;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    // Chỉ tự động sinh slug nếu chưa được set từ service
    if (this.title && !this.slug) {
      this.slug = this.slugify(this.title);
    }
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu tiếng Việt
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
