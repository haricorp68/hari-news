import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Community } from './community.entity';

@Entity()
export class CommunityRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  community: Community;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_owner: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
