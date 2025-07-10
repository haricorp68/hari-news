import { Entity, ManyToOne } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { BaseNewsPost } from './base-news-post.entity';

@Entity()
export class CompanyNewsPost extends BaseNewsPost {
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;
} 