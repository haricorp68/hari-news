import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { CommunityFeedPost } from '../entities/community_feed_post.entity';
import { PostMedia } from '../entities/post_media.entity';

@Injectable()
export class CommunityFeedPostRepository extends Repository<CommunityFeedPost> {
  constructor(private dataSource: DataSource) {
    super(CommunityFeedPost, dataSource.createEntityManager());
  }

  async getCommunityFeedPosts(communityId: number, limit = 20, offset = 0) {
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.community', 'community')
      .where('community.id = :communityId', { communityId })
      .andWhere('post.is_deleted = false')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
    // Lấy media cho từng post
    const postIds = posts.map(p => p.id);
    const media = await this.manager.getRepository(PostMedia).findBy({
      post_type: 'community_feed',
      post_id: postIds.length ? postIds : -1,
    } as any);
    for (const post of posts) {
      post['media'] = media.filter(m => m.post_id === post.id).sort((a, b) => a.order - b.order);
    }
    return posts;
  }

  async getCommunityFeedPostDetail(communityId: number, postId: number) {
    const post = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.community', 'community')
      .where('post.id = :postId', { postId })
      .andWhere('community.id = :communityId', { communityId })
      .andWhere('post.is_deleted = false')
      .getOne();
    if (!post) return null;
    post['media'] = await this.manager.getRepository(PostMedia).find({
      where: { post_type: 'community_feed', post_id: post.id },
      order: { order: 'ASC' },
    });
    return post;
  }
} 