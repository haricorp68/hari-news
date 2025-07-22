import { Injectable } from '@nestjs/common';
import { NewsTag } from '../entities/news_tag.entity';
import { ElasticService } from 'src/elastic/elastic.service';

export interface NewsTagSearchResult extends NewsTag {
  score?: number;
}

@Injectable()
export class NewsTagSearchService {
  private readonly index = 'news_tags';
  private readonly mappings = {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        fields: { keyword: { type: 'keyword' } },
      },
      name_no_accent: { type: 'text' },
      created_at: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis',
      },
      updated_at: {
        type: 'date',
        format: 'strict_date_optional_time||epoch_millis',
      },
    },
  };

  constructor(private readonly elasticService: ElasticService<NewsTag>) {}

  async createIndex() {
    return this.elasticService.createIndex(this.index, this.mappings);
  }

  async indexTag(tag: NewsTag) {
    return this.elasticService.indexDocument(this.index, tag.id, {
      id: tag.id,
      name: tag.name,
      created_at: tag['created_at'],
      updated_at: tag['updated_at'],
    });
  }

  async bulkIndexTags(tags: NewsTag[]) {
    return this.elasticService.bulkIndexDocuments(this.index, tags, (tag) => ({
      id: tag.id,
      name: tag.name,
      created_at: tag['created_at'],
      updated_at: tag['updated_at'],
    }));
  }

  async reindexAllTags(tags: NewsTag[]) {
    return this.elasticService.reindexAll(
      this.index,
      tags,
      this.mappings,
      (tag) => ({
        id: tag.id,
        name: tag.name,
        created_at: tag['created_at'],
        updated_at: tag['updated_at'],
      }),
    );
  }

  async searchByName(name: string): Promise<NewsTagSearchResult[]> {
    return this.elasticService.search(this.index, name, ['name'], { name: 2 });
  }

  async autocomplete(query: string): Promise<NewsTag[]> {
    return this.elasticService.autocomplete(this.index, query);
  }

  async updateTag(tag: NewsTag) {
    return this.elasticService.updateDocument(this.index, tag.id, {
      name: tag.name,
      updated_at: tag['updated_at'],
    });
  }

  async deleteTag(id: string) {
    return this.elasticService.deleteDocument(this.index, id);
  }
}
