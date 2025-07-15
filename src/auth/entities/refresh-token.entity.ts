import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum RefreshTokenType {
  LOCAL = 'local',
  OAUTH = 'oauth',
}

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  token: string; // Nên lưu dạng hash

  @Column({ nullable: true })
  device: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({
    type: 'enum',
    enum: RefreshTokenType,
    default: RefreshTokenType.LOCAL,
  })
  type: RefreshTokenType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;
}
