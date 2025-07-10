import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CompanyFeedPost } from '../entities/company_feed_post.entity';
import { PostMedia } from '../entities/post_media.entity';

@Injectable()
export class CompanyFeedPostRepository extends Repository<CompanyFeedPost> {
  constructor(private dataSource: DataSource) {
    super(CompanyFeedPost, dataSource.createEntityManager());
  }

  async getCompanyFeedPosts(companyId: number, limit = 20, offset = 0) {
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.company', 'company')
      .where('company.id = :companyId', { companyId })
      .andWhere('post.is_deleted = false')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
    // Lấy media cho từng post
    const postIds = posts.map(p => p.id);
    const media = await this.manager.getRepository(PostMedia).findBy({
      post_type: 'company_feed',
      post_id: postIds.length ? postIds : -1,
    } as any);
    for (const post of posts) {
      post['media'] = media.filter(m => m.post_id === post.id).sort((a, b) => a.order - b.order);
    }
    return posts;
  }

  async getCompanyFeedPostDetail(companyId: number, postId: number) {
    const post = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.company', 'company')
      .where('post.id = :postId', { postId })
      .andWhere('company.id = :companyId', { companyId })
      .andWhere('post.is_deleted = false')
      .getOne();
    if (!post) return null;
    post['media'] = await this.manager.getRepository(PostMedia).find({
      where: { post_type: 'company_feed', post_id: post.id },
      order: { order: 'ASC' },
    });
    return post;
  }
} 