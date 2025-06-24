import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  user_post_id: number;

  @Column({ nullable: true })
  community_post_id: number;

  @Column({ nullable: true })
  company_post_id: number;

  @Column({ nullable: true })
  comment_id: number;

  @Column()
  type: string; // 'like', 'love', 'haha', ...

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
