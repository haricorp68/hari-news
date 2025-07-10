import { Entity, ManyToOne } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { BaseFeedPost } from './base-feed-post.entity';

@Entity()
export class CompanyFeedPost extends BaseFeedPost {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;
} 