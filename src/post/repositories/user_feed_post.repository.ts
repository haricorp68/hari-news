import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserFeedPost } from '../entities/user_feed_post.entity';
import { PostMedia } from '../entities/post_media.entity';

@Injectable()
export class UserFeedPostRepository extends Repository<UserFeedPost> {
  constructor(private dataSource: DataSource) {
    super(UserFeedPost, dataSource.createEntityManager());
  }

  async getUserFeedPosts(userId: string, page = 1, pageSize = 20) {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;
    const posts = await this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.id = :userId', { userId })
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

  async getUserFeedPostDetail(userId: string | null, postId: string) {
    const query = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id = :postId', { postId })
      .andWhere('post.is_deleted = false');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    const post = await query.getOne();
    if (!post) return null;

    post['media'] = await this.manager.getRepository(PostMedia).find({
      where: { post_type: 'user_feed', post_id: post.id },
      order: { order: 'ASC' },
    });

    return post;
  }

  async getFeedOfFollowedUsers(followingIds: string[], limit = 20, offset = 0) {
    if (!followingIds.length) return [[], 0] as [UserFeedPost[], number];
    const queryBuilder = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('user.id IN (:...followingIds)', { followingIds })
      .andWhere('post.is_deleted = false')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit);
    // Log raw SQL
    console.log('🟡 [getFeedOfFollowedUsers] SQL:', queryBuilder.getSql());
    const [posts, total] = await queryBuilder.getManyAndCount();
    console.log('🔵 [getFeedOfFollowedUsers] posts:', posts);
    const postIds = posts.map((p) => p.id);
    console.log('🟣 [getFeedOfFollowedUsers] postIds:', postIds);
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
    console.log('🟠 [getFeedOfFollowedUsers] media:', media);
    for (const post of posts) {
      post['media'] = media.filter((m) => m.post_id === post.id);
      console.log(
        `🟤 [getFeedOfFollowedUsers] postId: ${post.id}, media:`,
        post['media'],
      );
    }
    console.log('⚫ [getFeedOfFollowedUsers] Final posts with media:', posts);
    return [posts, total];
  }
  async getAllUserFeedPosts(limit = 20, offset = 0) {
    const queryBuilder = this.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.is_deleted = false')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    // Log raw SQL để debug
    console.log('🟡 [getAllUserFeedPosts] SQL:', queryBuilder.getSql());

    const [posts, total] = await queryBuilder.getManyAndCount();
    console.log('🔵 [getAllUserFeedPosts] posts count:', posts.length);

    const postIds = posts.map((p) => p.id);
    console.log('🟣 [getAllUserFeedPosts] postIds:', postIds);

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

    console.log('🟠 [getAllUserFeedPosts] media count:', media.length);

    // Gán media cho từng post
    for (const post of posts) {
      post['media'] = media.filter((m) => m.post_id === post.id);
      console.log(
        `🟤 [getAllUserFeedPosts] postId: ${post.id}, media count:`,
        post['media'].length,
      );
    }

    console.log(
      '⚫ [getAllUserFeedPosts] Final posts with media:',
      posts.length,
    );
    return [posts, total];
  }
}
