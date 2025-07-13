import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Category } from './entities/category.entity';

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
        });
      }
    } catch (error) {
      console.error('Error creating index:', error);
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
            fuzziness: 'AUTO'
          }
        },
        sort: [
          { '_score': { order: 'desc' } },
          { 'name.keyword': { order: 'asc' } }
        ]
      });

      return result.hits.hits.map(hit => ({
        ...(hit._source as any),
        score: hit._score
      }));
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }

  async autocomplete(query: string): Promise<Category[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: this.index,
        query: {
          match: {
            name: {
              query,
              fuzziness: 'AUTO'
            }
          }
        },
        size: 10
      });

      return result.hits.hits.map(hit => hit._source as any);
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
          description: category.description,
          coverImage: category.coverImage,
          parentId: category.parentId,
          updated_at: category.updated_at
        }
      });
    } catch (error) {
      console.error('Error updating category in ES:', error);
    }
  }

  async deleteCategory(id: string) {
    try {
      return await this.elasticsearchService.delete({
        index: this.index,
        id
      });
    } catch (error) {
      console.error('Error deleting category from ES:', error);
    }
  }

  async bulkIndexCategories(categories: Category[]) {
    try {
      const operations = categories.flatMap(category => [
        { index: { _index: this.index, _id: category.id } },
        {
          id: category.id,
          name: category.name,
          description: category.description,
          coverImage: category.coverImage,
          parentId: category.parentId,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      ]);

      if (operations.length > 0) {
        const result = await this.elasticsearchService.bulk({
          operations
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
        index: this.index
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