import { Injectable } from '@nestjs/common';
import { NewsTagRepository } from '../repositories/news_tag.repository';
import { NewsTag } from '../entities/news_tag.entity';
import { CreateNewsTagDto, UpdateNewsTagDto } from '../dto/news-tag.dto';

@Injectable()
export class NewsTagService {
  constructor(private readonly newsTagRepository: NewsTagRepository) {}

  async create(dto: CreateNewsTagDto): Promise<NewsTag> {
    const tag = this.newsTagRepository.create(dto);
    return this.newsTagRepository.save(tag);
  }

  async findAll(): Promise<NewsTag[]> {
    return this.newsTagRepository.find();
  }

  async findOne(id: string): Promise<NewsTag | null> {
    return this.newsTagRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateNewsTagDto): Promise<NewsTag | null> {
    const tag = await this.newsTagRepository.findOne({ where: { id } });
    if (!tag) return null;
    Object.assign(tag, dto);
    return this.newsTagRepository.save(tag);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.newsTagRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
