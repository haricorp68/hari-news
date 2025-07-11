import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<Comment> {
  constructor(private dataSource: DataSource) {
    super(Comment, dataSource.createEntityManager());
  }

  async findParentCommentsByPost(postId: string, page = 1, pageSize = 10) {
    return this.findAndCount({
      where: { postId, parentId: IsNull() },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['user'],
    });
  }
  // Thêm các method custom cho comment ở đây nếu cần
} 