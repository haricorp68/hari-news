import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CommunityRole } from './community_role.entity';
import { CommunityPermission } from './community_permission.entity';

@Entity()
export class CommunityRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CommunityRole, { onDelete: 'CASCADE' })
  role: CommunityRole;

  @ManyToOne(() => CommunityPermission, { onDelete: 'CASCADE' })
  permission: CommunityPermission;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
