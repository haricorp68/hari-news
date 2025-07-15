import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CommentRepository } from './repositories/comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { CommentResponseDto } from './dto/comment-response.dto';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      userId,
    });
    const saved = await this.commentRepository.save(comment);
    const withUser = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
    if (!withUser) throw new NotFoundException('Comment not found');
    return this.toResponseDto(withUser);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('No permission');
    Object.assign(comment, updateCommentDto);
    await this.commentRepository.save(comment);
    const withUser = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!withUser) throw new NotFoundException('Comment not found');
    return this.toResponseDto(withUser);
  }

  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('No permission');
    await this.commentRepository.softDelete(id);
    return { deleted: true };
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    return this.toResponseDto(comment);
  }

  private async toResponseDto(comment: Comment): Promise<CommentResponseDto> {
    const childCount = await this.commentRepository.countAllDescendants(
      comment.id,
    );
    console.log('DEBUG created_at:', comment.created_at); // Log giá trị created_at
    return {
      id: comment.id,
      postId: comment.postId,
      content: comment.content,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            avatar: comment.user.avatar,
          }
        : { id: '', name: '', avatar: '' },
      parentId: comment.parentId,
      media: comment.media,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      childCount,
    };
  }

  async findByPost(postId: string, page = 1, pageSize = 10) {
    const [data, total] = await this.commentRepository.findParentCommentsByPost(
      postId,
      page,
      pageSize,
    );
    const dataWithCount = await Promise.all(
      data.map((c) => this.toResponseDto(c)),
    );
    return {
      data: dataWithCount,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findReplies(parentId: string, page = 1, pageSize = 10) {
    const [data, total] = await this.commentRepository.findAndCount({
      where: { parentId },
      order: { created_at: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['user'],
    });
    const dataWithCount = await Promise.all(
      data.map((c) => this.toResponseDto(c)),
    );
    return {
      data: dataWithCount,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getCommentCountByPost(postId: string): Promise<number> {
    return this.commentRepository.count({ where: { postId } });
  }
}
