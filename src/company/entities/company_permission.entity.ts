import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity()
export class CompanyPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
