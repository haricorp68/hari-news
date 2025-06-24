import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { User } from 'src/user/entities/user.entity';
import { CompanyRole } from './company_role.entity';

@Entity()
export class CompanyStaff {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => CompanyRole, { onDelete: 'SET NULL', nullable: true })
  role: CompanyRole;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  joined_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
