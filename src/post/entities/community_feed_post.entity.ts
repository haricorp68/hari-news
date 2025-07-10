import { Entity, ManyToOne } from 'typeorm';
import { Community } from '../../community/entities/community.entity';
import { BaseFeedPost } from './base-feed-post.entity';

@Entity()
export class CommunityFeedPost extends BaseFeedPost {
  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  community: Community;
} 