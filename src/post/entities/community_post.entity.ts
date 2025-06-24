import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Community } from 'src/community/entities/community.entity';

@Entity()
export class CommunityPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  community: Community;

  @Column()
  type: string; // 'personal', 'news'

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
