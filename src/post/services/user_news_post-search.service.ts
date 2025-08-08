import { Injectable } from '@nestjs/common';
import { UserNewsPost } from '../entities/user_news_post.entity';
import { ElasticService } from 'src/elastic/elastic.service';

export interface UserNewsPostSearchResult extends UserNewsPost {
  score?: number;
}

@Injectable()
export class UserNewsPostSearchService {
  private readonly index = 'user_news_posts';

  // Settings with analyzer for Vietnamese text
  private readonly settings = {
    analysis: {
      analyzer: {
        vietnamese_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  };

  private readonly mappings = {
    properties: {
      id: { type: 'keyword' },
      title: {
        type: 'text',
        fields: {
          keyword: { type: 'keyword' },
          vietnamese: {
            type: 'text',
            analyzer: 'vietnamese_analyzer',
          },
        },
      },
      summary: {
        type: 'text',
        fields: {
          vietnamese: {
            type: 'text',
            analyzer: 'vietnamese_analyzer',
          },
        },
      },
      slug: { type: 'keyword' },
      categoryId: { type: 'keyword' },
      tagIds: { type: 'keyword' }, // Store tag IDs as keywords for filtering
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

  constructor(private readonly elasticService: ElasticService<UserNewsPost>) {}

  async createIndex() {
    return this.elasticService.createIndex(
      this.index,
      this.mappings,
      this.settings,
    );
  }

  async indexPost(post: UserNewsPost) {
    return this.elasticService.indexDocument(this.index, post.id, {
      id: post.id,
      title: post.title,
      summary: post.summary,
      slug: post.slug,
      cover_image: post.cover_image,
      categoryId: post.categoryId,
      tagIds: post.tags?.map((tag) => tag.id) || [],
      created_at: post.created_at,
      updated_at: post.updated_at,
    });
  }

  async bulkIndexPosts(posts: UserNewsPost[]) {
    return this.elasticService.bulkIndexDocuments(
      this.index,
      posts,
      (post) => ({
        id: post.id,
        title: post.title,
        summary: post.summary,
        cover_image: post.cover_image,
        slug: post.slug,
        categoryId: post.categoryId,
        tagIds: post.tags?.map((tag) => tag.id) || [],
        created_at: post.created_at,
        updated_at: post.updated_at,
      }),
    );
  }

  async reindexAllPosts(posts: UserNewsPost[]) {
    return this.elasticService.reindexAll(
      this.index,
      posts,
      this.mappings,
      (post) => ({
        id: post.id,
        title: post.title,
        summary: post.summary,
        slug: post.slug,
        categoryId: post.categoryId,
        tagIds: post.tags?.map((tag) => tag.id) || [],
        created_at: post.created_at,
        updated_at: post.updated_at,
      }),
      this.settings,
    );
  }

  async searchByTitleOrSummary(
    query: string,
  ): Promise<UserNewsPostSearchResult[]> {
    return this.elasticService.search(
      this.index,
      query,
      ['title', 'summary', 'title.vietnamese', 'summary.vietnamese'],
      { title: 2, summary: 1 },
    );
  }

  async autocomplete(query: string): Promise<UserNewsPost[]> {
    return this.elasticService.autocomplete(this.index, query, [
      'title',
      'summary',
    ]);
  }

  async updatePost(post: UserNewsPost) {
    return this.elasticService.updateDocument(this.index, post.id, {
      title: post.title,
      summary: post.summary,
      slug: post.slug,
      categoryId: post.categoryId,
      tagIds: post.tags?.map((tag) => tag.id) || [],
      updated_at: post.updated_at,
    });
  }

  async deletePost(id: string) {
    return this.elasticService.deleteDocument(this.index, id);
  }
}
