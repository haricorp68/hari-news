import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserFeedPost } from '../entities/user_feed_post.entity';
import { PostMedia } from '../entities/post_media.entity';

@Injectable()
export class UserFeedPostRepository extends Repository<UserFeedPost> {
  constructor(private dataSource: DataSource) {
    super(UserFeedPost, dataSource.createEntityManager());
  }

  async getUserFeedPosts(userId: string, limit = 20, offset = 0) {
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('post.is_deleted = false')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
    // Lấy media cho từng post
    const postIds = posts.map((p) => p.id);
    let media: PostMedia[] = [];
    if (postIds.length) {
      media = await this.manager
        .getRepository(PostMedia)
        .createQueryBuilder('media')
        .where('media.post_type = :postType', { postType: 'user_feed' })
        .andWhere('media.post_id IN (:...postIds)', { postIds })
        .orderBy('media.order', 'ASC')
        .getMany();
    }
    for (const post of posts) {
      post['media'] = media.filter((m) => m.post_id === post.id);
    }
    return posts;
  }

  async getUserFeedPostDetail(userId: string, postId: string) {
    const post = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :postId', { postId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('post.is_deleted = false')
      .getOne();
    if (!post) return null;
    post['media'] = await this.manager.getRepository(PostMedia).find({
      where: { post_type: 'user_feed', post_id: post.id },
      order: { order: 'ASC' },
    });
    return post;
  }
}
