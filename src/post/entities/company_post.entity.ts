import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from 'src/company/entities/company.entity';

@Entity()
export class CompanyPost {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

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
