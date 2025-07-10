import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PostType } from '../../post/enums/post.enums';

export enum ReactionType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  LOVE = 'love',
  HAHA = 'haha',
  SAD = 'sad',
  ANGRY = 'angry',
  MEH = 'meh',
}

export enum EntityType {
  USER = 'user',
  COMPANY = 'company',
  COMMUNITY = 'community',
}

@Entity('reactions')
@Index(['postType', 'postId', 'entityType', 'entityId'])
@Index(['userId', 'postType', 'postId', 'entityType', 'entityId'], { unique: true })
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ReactionType,
    default: ReactionType.LIKE,
  })
  type: ReactionType;

  @Column({
    type: 'enum',
    enum: PostType,
  })
  postType: PostType;

  @Column('uuid')
  postId: string;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entityType: EntityType;

  @Column('uuid')
  entityId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
