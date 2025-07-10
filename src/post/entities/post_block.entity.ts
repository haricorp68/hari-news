import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum BlockType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
}

@Entity()
export class PostBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_type: string; // 'user_news', 'community_news', 'company_news'

  @Column()
  post_id: number;

  @Column({ type: 'enum', enum: BlockType })
  type: BlockType; // 'text', 'image', 'video', 'file'

  @Column({ type: 'text', nullable: true })
  content: string; // Nội dung văn bản hoặc mô tả

  @Column({ nullable: true })
  media_url: string; // URL của ảnh/video/file

  @Column({ nullable: true })
  file_name: string; // Tên file nếu là file

  @Column({ nullable: true })
  file_size: number; // Kích thước file (bytes)

  @Column()
  order: number; // Thứ tự hiển thị
} 