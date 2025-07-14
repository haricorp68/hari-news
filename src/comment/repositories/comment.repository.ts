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

  // Đệ quy đếm tổng số comment con (mọi cấp) của một comment
  async countAllDescendants(commentId: string): Promise<number> {
    const children = await this.find({ where: { parentId: commentId } });
    let count = children.length;
    for (const child of children) {
      count += await this.countAllDescendants(child.id);
    }
    return count;
  }
  // Thêm các method custom cho comment ở đây nếu cần
} 