import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BasePost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
