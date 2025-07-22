import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as removeAccents from 'remove-accents';

@Injectable()
export class ElasticService<T> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(index: string, mappings: any) {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index,
      });
      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index,
          mappings,
        });
        console.log(`Index ${index} created successfully`);
      }
    } catch (error) {
      console.error(`Error creating index ${index}:`, error);
      throw error;
    }
  }

  async indexDocument(index: string, id: string, document: any) {
    try {
      return await this.elasticsearchService.index({
        index,
        id,
        document: {
          ...document,
          name_no_accent: document.name
            ? removeAccents(document.name).toLowerCase()
            : undefined,
        },
      });
    } catch (error) {
      console.error(`Error indexing document in ${index}:`, error);
    }
  }

  async bulkIndexDocuments(
    index: string,
    documents: T[],
    transform: (doc: T) => any,
  ) {
    try {
      const operations = documents.flatMap((doc) => [
        { index: { _index: index, _id: (doc as any).id } },
        transform(doc),
      ]);

      if (operations.length > 0) {
        const result = await this.elasticsearchService.bulk({ operations });
        console.log(`Bulk indexed ${documents.length} documents to ${index}`);
        return result;
      }
    } catch (error) {
      console.error(`Error bulk indexing documents to ${index}:`, error);
    }
  }

  async search(
    index: string,
    query: string,
    fields: string[],
    boostFields?: Record<string, number>,
  ) {
    try {
      const result = await this.elasticsearchService.search({
        index,
        query: {
          multi_match: {
            query,
            fields: fields.map((field) =>
              boostFields?.[field] ? `${field}^${boostFields[field]}` : field,
            ),
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
      console.error(`Error searching in ${index}:`, error);
      return [];
    }
  }

  async autocomplete(index: string, query: string) {
    try {
      const queryNoAccent = removeAccents(query).toLowerCase();
      const result = await this.elasticsearchService.search({
        index,
        query: {
          bool: {
            should: [
              { match: { name: { query, boost: 5.0 } } },
              {
                prefix: {
                  name_no_accent: { value: queryNoAccent, boost: 5.0 },
                },
              },
              {
                wildcard: {
                  name: { value: `*${query.toLowerCase()}*`, boost: 2.0 },
                },
              },
              {
                wildcard: {
                  name_no_accent: { value: `*${queryNoAccent}*`, boost: 2.0 },
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
      console.error(`Error autocomplete in ${index}:`, error);
      return [];
    }
  }

  async updateDocument(index: string, id: string, document: any) {
    try {
      return await this.elasticsearchService.update({
        index,
        id,
        doc: {
          ...document,
          name_no_accent: document.name
            ? removeAccents(document.name).toLowerCase()
            : undefined,
        },
      });
    } catch (error) {
      console.error(`Error updating document in ${index}:`, error);
    }
  }

  async deleteDocument(index: string, id: string) {
    try {
      return await this.elasticsearchService.delete({ index, id });
    } catch (error) {
      console.error(`Error deleting document from ${index}:`, error);
    }
  }

  async reindexAll(
    index: string,
    documents: T[],
    mappings: any,
    transform: (doc: T) => any,
  ) {
    try {
      await this.elasticsearchService.indices.delete({ index });
      await this.createIndex(index, mappings);
      await this.bulkIndexDocuments(index, documents, transform);
      console.log(`Reindex ${index} completed successfully`);
    } catch (error) {
      console.error(`Error reindexing ${index}:`, error);
    }
  }
}
