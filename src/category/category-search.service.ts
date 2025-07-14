import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Category } from './entities/category.entity';
import * as removeAccents from 'remove-accents';

export interface CategorySearchResult extends Category {
  score?: number;
}

@Injectable()
export class CategorySearchService {
  private readonly index = 'categories';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: { 
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' }
                }
              },
              name_no_accent: { type: 'text' },
              description: { type: 'text' },
              coverImage: { type: 'keyword' },
              parentId: { type: 'keyword' },
              created_at: { type: 'date' },
              updated_at: { type: 'date' },
            },
          },
        });
        console.log('Index created successfully');
      }
    } catch (error) {
      console.error('Error creating index:', error);
      throw error;
    }
  }

  async indexCategory(category: Category) {
    try {
      return await this.elasticsearchService.index({
        index: this.index,
        id: category.id,
        document: {
          id: category.id,
          name: category.name,
          name_no_accent: removeAccents(category.name).toLowerCase(),
          description: category.description,
          coverImage: category.coverImage,
          parentId: category.parentId,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      });
    } catch (error) {
      console.error('Error indexing category:', error);
    }
  }

  async searchByName(name: string): Promise<CategorySearchResult[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.index,
        query: {
          multi_match: {
            query: name,
            fields: ['name^2', 'description'],
            fuzziness: 'AUTO',
          },
        },
        sort: [
          { _score: { order: 'desc' } },
          { 'name.keyword': { order: 'asc' } },
        ],
      });

      return result.hits.hits.map((hit) => ({
        ...(hit._source as any),
        score: hit._score,
      }));
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }

  async autocomplete(query: string): Promise<Category[]> {
    try {
      const queryNoAccent = removeAccents(query).toLowerCase();
      const result = await this.elasticsearchService.search({
        index: this.index,
        query: {
          bool: {
            should: [
              // Tìm trên trường name (có dấu) - match
              {
                match: {
                  name: {
                    query: query,
                    operator: 'or',
                    boost: 5.0,
                  },
                },
              },
              // Tìm trên trường name_no_accent (không dấu) - prefix
              {
                prefix: {
                  name_no_accent: {
                    value: queryNoAccent,
                    boost: 5.0,
                  },
                },
              },
              // Tìm trên trường name (có dấu) - wildcard
              {
                wildcard: {
                  name: {
                    value: `*${query.toLowerCase()}*`,
                    boost: 2.0,
                  },
                },
              },
              // Tìm trên trường name_no_accent (không dấu) - wildcard
              {
                wildcard: {
                  name_no_accent: {
                    value: `*${queryNoAccent}*`,
                    boost: 2.0,
                  },
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
        sort: [
          { _score: { order: 'desc' } },
          { 'name.keyword': { order: 'asc' } },
        ],
        size: 10,
      });

      return result.hits.hits.map((hit) => hit._source as any);
    } catch (error) {
      console.error('Error autocomplete:', error);
      return [];
    }
  }

  async updateCategory(category: Category) {
    try {
      return await this.elasticsearchService.update({
        index: this.index,
        id: category.id,
        doc: {
          name: category.name,
          name_no_accent: removeAccents(category.name).toLowerCase(),
          description: category.description,
          coverImage: category.coverImage,
          parentId: category.parentId,
          updated_at: category.updated_at,
        },
      });
    } catch (error) {
      console.error('Error updating category in ES:', error);
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.elasticsearchService.delete({
        index: this.index,
        id,
      });
    } catch (error) {
      console.error('Error deleting category from ES:', error);
    }
  }

  async bulkIndexCategories(categories: Category[]) {
    try {
      const operations = categories.flatMap((category) => [
        { index: { _index: this.index, _id: category.id } },
        {
          id: category.id,
          name: category.name,
          name_no_accent: removeAccents(category.name).toLowerCase(),
          description: category.description,
          coverImage: category.coverImage,
          parentId: category.parentId,
          created_at: category.created_at,
          updated_at: category.updated_at,
        },
      ]);

      if (operations.length > 0) {
        const result = await this.elasticsearchService.bulk({
          operations,
        });

        console.log(`Bulk indexed ${categories.length} categories`);
        return result;
      }
    } catch (error) {
      console.error('Error bulk indexing categories:', error);
    }
  }

  async reindexAllCategories(categories: Category[]) {
    try {
      // Delete existing index
      await this.elasticsearchService.indices.delete({
        index: this.index,
      });

      // Recreate index
      await this.createIndex();

      // Bulk index all categories
      await this.bulkIndexCategories(categories);

      console.log('Reindex completed successfully');
    } catch (error) {
      console.error('Error reindexing categories:', error);
    }
  }
}
