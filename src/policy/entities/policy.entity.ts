import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('policy')
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subjectType: string; // 'user' | 'role' | 'group'

  @Column()
  subjectId: string; // id của user/role/group

  @Column()
  action: string;

  @Column()
  resource: string;

  @Column({ type: 'json', nullable: true })
  condition: Record<string, any>;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 