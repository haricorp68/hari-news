import { Entity, ManyToOne } from 'typeorm';
import { Community } from '../../community/entities/community.entity';
import { BaseNewsPost } from './base-news-post.entity';
 
@Entity()
export class CommunityNewsPost extends BaseNewsPost {
  @ManyToOne(() => Community, { onDelete: 'CASCADE' })
  community: Community;
} 