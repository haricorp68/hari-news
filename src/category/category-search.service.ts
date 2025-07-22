import { Injectable } from '@nestjs/common';
import { ElasticService } from '../elastic/elastic.service';
import { Category } from './entities/category.entity';

export interface CategorySearchResult extends Category {
  score?: number;
}

@Injectable()
export class CategorySearchService {
  private readonly index = 'categories';
  private readonly mappings = {
    properties: {
      id: { type: 'keyword' },
      name: {
        type: 'text',
        fields: { keyword: { type: 'keyword' } },
      },
      name_no_accent: { type: 'text' },
      description: { type: 'text' },
      coverImage: { type: 'keyword' },
      parentId: { type: 'keyword' },
      created_at: { type: 'date' },
      updated_at: { type: 'date' },
    },
  };

  constructor(private readonly elasticService: ElasticService<Category>) {}

  async createIndex() {
    return this.elasticService.createIndex(this.index, this.mappings);
  }

  async indexCategory(category: Category) {
    return this.elasticService.indexDocument(this.index, category.id, {
      id: category.id,
      name: category.name,
      description: category.description,
      coverImage: category.coverImage,
      parentId: category.parentId,
      created_at: category.created_at,
      updated_at: category.updated_at,
    });
  }

  async searchByName(name: string): Promise<CategorySearchResult[]> {
    return this.elasticService.search(
      this.index,
      name,
      ['name', 'description'],
      { name: 2 },
    );
  }

  async autocomplete(query: string): Promise<Category[]> {
    return this.elasticService.autocomplete(this.index, query);
  }

  async updateCategory(category: Category) {
    return this.elasticService.updateDocument(this.index, category.id, {
      name: category.name,
      description: category.description,
      coverImage: category.coverImage,
      parentId: category.parentId,
      updated_at: category.updated_at,
    });
  }

  async deleteCategory(id: string) {
    return this.elasticService.deleteDocument(this.index, id);
  }

  async bulkIndexCategories(categories: Category[]) {
    return this.elasticService.bulkIndexDocuments(
      this.index,
      categories,
      (category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        coverImage: category.coverImage,
        parentId: category.parentId,
        created_at: category.created_at,
        updated_at: category.updated_at,
      }),
    );
  }

  async reindexAllCategories(categories: Category[]) {
    return this.elasticService.reindexAll(
      this.index,
      categories,
      this.mappings,
      (category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        coverImage: category.coverImage,
        parentId: category.parentId,
        created_at: category.created_at,
        updated_at: category.updated_at,
      }),
    );
  }
}
