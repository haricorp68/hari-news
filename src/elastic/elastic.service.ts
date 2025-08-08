import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as removeAccents from 'remove-accents';

@Injectable()
export class ElasticService<T> {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async createIndex(index: string, mappings: any, settings?: any) {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index,
      });
      if (!indexExists) {
        const indexConfig: any = { index, mappings };
        if (settings) {
          indexConfig.settings = settings;
        }

        await this.elasticsearchService.indices.create(indexConfig);
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
        {
          ...transform(doc),
          name_no_accent: transform(doc).name
            ? removeAccents(transform(doc).name).toLowerCase()
            : undefined,
        },
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
      // Xử lý query để tối ưu tìm kiếm
      const queryNoAccent = removeAccents(query).toLowerCase().trim();
      const queryWords = queryNoAccent
        .split(/\s+/)
        .filter((word) => word.length > 0);

      const result = await this.elasticsearchService.search({
        index,
        query: {
          bool: {
            should: [
              // Exact match có boost cao nhất
              {
                match_phrase: {
                  'name.keyword': {
                    query: query,
                    boost: 10,
                  },
                },
              },
              // Match phrase không dấu
              {
                match_phrase: {
                  name_no_accent: {
                    query: queryNoAccent,
                    boost: 8,
                  },
                },
              },
              // Multi-match cho tìm kiếm thông thường
              {
                multi_match: {
                  query: queryNoAccent,
                  fields: ['name_no_accent'],
                  type: 'phrase_prefix',
                  boost: 6,
                },
              },
              // Bool query cho từng từ riêng lẻ (cho case "bong d" -> "bóng đá")
              {
                bool: {
                  must: queryWords.map((word) => ({
                    wildcard: {
                      name_no_accent: {
                        value: `*${word}*`,
                        boost: 1,
                      },
                    },
                  })),
                  boost: 4,
                },
              },
              // Wildcard search cho cả chuỗi
              {
                wildcard: {
                  name_no_accent: {
                    value: `*${queryNoAccent.replace(/\s+/g, '*')}*`,
                    boost: 3,
                  },
                },
              },
              // Regexp search cho flexible matching
              {
                regexp: {
                  name_no_accent: {
                    value: queryWords.map((word) => `.*${word}.*`).join(''),
                    boost: 2,
                  },
                },
              },
              // Fallback wildcard
              {
                wildcard: {
                  name_no_accent: {
                    value: `*${queryNoAccent}*`,
                    boost: 1,
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

  // Thêm method mới cho search với custom query
  async searchWithQuery(index: string, query: any, options?: any) {
    try {
      const searchParams: any = {
        index,
        query,
        sort: [
          { _score: { order: 'desc' } },
          { 'name.keyword': { order: 'asc' } },
        ],
      };

      if (options?.size) {
        searchParams.size = options.size;
      }

      const result = await this.elasticsearchService.search(searchParams);

      return result.hits.hits.map((hit) => ({
        ...(hit._source as any),
        score: hit._score,
      }));
    } catch (error) {
      console.error(`Error searching with custom query in ${index}:`, error);
      return [];
    }
  }

  async autocomplete(
    index: string,
    query: string,
    fields: string[] = ['name', 'name_no_accent'],
  ) {
    try {
      const queryNoAccent = removeAccents(query).toLowerCase().trim();
      const queryWords = queryNoAccent
        .split(/\s+/)
        .filter((word) => word.length > 0);

      const shouldClauses: any[] = [
        // Exact prefix match
        {
          match_phrase_prefix: {
            [fields[0]]: {
              query,
              boost: 10.0,
            },
          },
        },
        // Prefix match without accents
        {
          match_phrase_prefix: {
            [`${fields[0]}_no_accent`]: {
              query: queryNoAccent,
              boost: 8.0,
            },
          },
        },
        // Match on all specified fields
        ...fields.map((field) => ({
          match: {
            [`${field}_no_accent`]: {
              query: queryNoAccent,
              boost: 5.0,
            },
          },
        })),
        // Prefix for single word
        {
          prefix: {
            [`${fields[0]}_no_accent`]: {
              value: queryNoAccent,
              boost: 4.0,
            },
          },
        },
        // Wildcard for partial match
        {
          wildcard: {
            [`${fields[0]}_no_accent`]: {
              value: `*${queryNoAccent.replace(/\s+/g, '*')}*`,
              boost: 3.0,
            },
          },
        },
        // Wildcard general
        {
          wildcard: {
            [`${fields[0]}_no_accent`]: {
              value: `*${queryNoAccent}*`,
              boost: 2.0,
            },
          },
        },
      ];

      if (queryWords.length > 1) {
        shouldClauses.push({
          bool: {
            must: queryWords.map((word, index) => {
              if (index === queryWords.length - 1) {
                return {
                  prefix: {
                    [`${fields[0]}_no_accent`]: {
                      value: word,
                      boost: 1,
                    },
                  },
                };
              } else {
                return {
                  wildcard: {
                    [`${fields[0]}_no_accent`]: {
                      value: `*${word}*`,
                      boost: 1,
                    },
                  },
                };
              }
            }),
            boost: 6.0,
          },
        });
      }

      const result = await this.elasticsearchService.search({
        index,
        query: {
          bool: {
            should: shouldClauses,
            minimum_should_match: 1,
          },
        },
        sort: [
          { _score: { order: 'desc' } },
          { [`${fields[0]}.keyword`]: { order: 'asc' } },
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
    settings?: any,
  ) {
    try {
      await this.elasticsearchService.indices.delete({ index });
      await this.createIndex(index, mappings, settings);
      await this.bulkIndexDocuments(index, documents, transform);
      console.log(`Reindex ${index} completed successfully`);
    } catch (error) {
      console.error(`Error reindexing ${index}:`, error);
    }
  }
}
