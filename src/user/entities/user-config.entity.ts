import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PrivacyType } from '../enums/user.enum';

@Entity('user_config')
export class UserConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpiresAt: Date;

  @Column({ default: true })
  emailNotifications: boolean;

  @Column({ type: 'enum', enum: PrivacyType, default: PrivacyType.PUBLIC })
  privacy: PrivacyType;
}
