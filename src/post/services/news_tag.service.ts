import { Injectable } from '@nestjs/common';
import { NewsTagRepository } from '../repositories/news_tag.repository';
import { NewsTag } from '../entities/news_tag.entity';
import { CreateNewsTagDto, UpdateNewsTagDto } from '../dto/news-tag.dto';
import { NewsTagSearchService } from './news_tag-search.service';

@Injectable()
export class NewsTagService {
  constructor(
    private readonly newsTagRepository: NewsTagRepository,
    private readonly newsTagSearchService: NewsTagSearchService,
  ) {}

  async create(dto: CreateNewsTagDto): Promise<NewsTag> {
    const tag = this.newsTagRepository.create(dto);
    const saved = await this.newsTagRepository.save(tag);
    await this.newsTagSearchService.indexTag(saved);
    return saved;
  }

  async findAll(): Promise<NewsTag[]> {
    return this.newsTagRepository.find();
  }

  async findAllWithPagination(page = 1, pageSize = 20) {
    const [data, total] = await this.newsTagRepository.findAndCount({
      order: { name: 'ASC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return {
      data,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: string): Promise<NewsTag | null> {
    return this.newsTagRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateNewsTagDto): Promise<NewsTag | null> {
    const tag = await this.newsTagRepository.findOne({ where: { id } });
    if (!tag) return null;
    Object.assign(tag, dto);
    const saved = await this.newsTagRepository.save(tag);
    await this.newsTagSearchService.updateTag(saved);
    return saved;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.newsTagRepository.delete(id);
    if ((result.affected ?? 0) > 0) {
      await this.newsTagSearchService.deleteTag(id);
      return true;
    }
    return false;
  }

  async search(q: string, page = 1, pageSize = 20) {
    const allResults = await this.newsTagSearchService.searchByName(q);
    const total = allResults.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allResults.slice(start, end);
    return {
      data,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async autocomplete(q: string, page = 1, pageSize = 20) {
    const allResults = await this.newsTagSearchService.autocomplete(q);
    const total = allResults.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = allResults.slice(start, end);
    return {
      data,
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
