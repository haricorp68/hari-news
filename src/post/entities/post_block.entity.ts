import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum BlockType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  HEADING_1 = 'heading_1', // Heading cấp 1
  HEADING_2 = 'heading_2', // Heading cấp 2
  HEADING_3 = 'heading_3', // Heading cấp 3
}

@Entity()
export class PostBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  post_type: string; // 'user_news', 'community_news', 'company_news'

  @Column()
  post_id: string;

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
