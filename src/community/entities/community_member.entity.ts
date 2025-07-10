import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Community } from './community.entity';
import { User } from 'src/user/entities/user.entity';
import { CommunityRole } from './community_role.entity';

@Entity()
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  community: Community;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => CommunityRole, { onDelete: 'SET NULL', nullable: true })
  role: CommunityRole;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  joined_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
