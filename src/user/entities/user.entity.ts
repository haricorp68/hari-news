import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';
import { UserConfig } from './user-config.entity';
import { Follow } from '../../follow/entities/follow.entity';
import { SocialPlatform } from '../enums/user.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true, unique: true })
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Partial<Record<SocialPlatform, string>>;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'other'],
    nullable: true,
  })
  gender: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  emailVerifiedAt: Date;

  @Column({ nullable: true })
  phoneVerifiedAt: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'active', 'suspended', 'banned'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user',
  })
  role: string;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ default: 0 })
  loginCount: number;

  @Column({ nullable: true })
  lastPasswordChangeAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToOne(() => UserConfig, (userConfig) => userConfig.user, {
    cascade: true,
  })
  config: UserConfig;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @Column({ default: 0 })
  newsPostsCount: number;

  @Column({ default: 0 })
  feedPostsCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @Column({ nullable: true, unique: true })
  alias: string;
  @Column({ default: false, type: 'boolean' })
  isCompletedTutorial: boolean;
}
