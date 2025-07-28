import { Injectable } from '@nestjs/common';
import { Repository, DataSource, In } from 'typeorm';
import { NewsTag } from '../entities/news_tag.entity';

@Injectable()
export class NewsTagRepository extends Repository<NewsTag> {
  constructor(private dataSource: DataSource) {
    super(NewsTag, dataSource.createEntityManager());
  }

  /**
   * Creates new news tags from a list of names.
   * If a tag name already exists in the database, it will be skipped.
   * Only new tag names will be inserted.
   *
   * @param tagNames An array of strings representing the tag names to be created.
   * @returns A Promise that resolves to an object containing:
   * - `addedTags`: An array of NewsTag entities that were newly added to the database.
   * - `addedCount`: The number of tags that were newly added.
   */
  async createManyIfNotExists(
    tagNames: string[],
  ): Promise<{ addedTags: NewsTag[]; addedCount: number }> {
    if (tagNames.length === 0) {
      return { addedTags: [], addedCount: 0 };
    }

    const uniqueTagNames = [...new Set(tagNames)];

    const existingTags = await this.find({
      where: {
        name: In(uniqueTagNames),
      },
    });

    const existingTagNames = new Set(existingTags.map((tag) => tag.name));

    const newTagNamesToCreate = uniqueTagNames.filter(
      (name) => !existingTagNames.has(name),
    );

    const addedTags: NewsTag[] = [];

    if (newTagNamesToCreate.length > 0) {
      const tagsToSave = newTagNamesToCreate.map((name) =>
        this.create({ name }),
      );
      const savedNewTags = await this.save(tagsToSave);
      addedTags.push(...savedNewTags);
    }

    return {
      addedTags: addedTags,
      addedCount: addedTags.length,
    };
  }
}
