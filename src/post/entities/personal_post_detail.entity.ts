import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PersonalPostDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  post_type: string; // 'user', 'community', 'company'

  @Column()
  post_id: number;

  @Column({ type: 'text', nullable: true })
  caption: string;
}
