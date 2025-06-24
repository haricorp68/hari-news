import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CompanyRole } from './company_role.entity';
import { CompanyPermission } from './company_permission.entity';

@Entity()
export class CompanyRolePermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CompanyRole, { onDelete: 'CASCADE' })
  role: CompanyRole;

  @ManyToOne(() => CompanyPermission, { onDelete: 'CASCADE' })
  permission: CompanyPermission;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
