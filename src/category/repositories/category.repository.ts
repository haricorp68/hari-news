// src/category/repositories/category.repository.ts
import { DataSource, In, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(private dataSource: DataSource) {
    super(Category, dataSource.createEntityManager());
  }

  /**
   * Creates multiple new categories from a list of data.
   * If a category name already exists in the database, it will be skipped.
   * Only new categories will be inserted.
   *
   * @param categoriesData An array of objects, each representing the data for a category to be created.
   * @returns A Promise that resolves to an object containing:
   * - `addedCategories`: An array of Category entities that were newly added to the database.
   * - `addedCount`: The number of categories that were newly added.
   */
  async createManyIfNotExists(
    categoriesData: CreateCategoryDto[],
  ): Promise<{ addedCategories: Category[]; addedCount: number }> {
    if (categoriesData.length === 0) {
      return { addedCategories: [], addedCount: 0 };
    }

    const uniqueCategoryNames = [
      ...new Set(categoriesData.map((data) => data.name)),
    ];

    const existingCategories = await this.find({
      where: {
        name: In(uniqueCategoryNames),
      },
    });

    const existingCategoryNames = new Set(
      existingCategories.map((category) => category.name),
    );

    const newCategoriesToCreate = categoriesData.filter(
      (data) => !existingCategoryNames.has(data.name),
    );

    const addedCategories: Category[] = [];

    if (newCategoriesToCreate.length > 0) {
      // Chuyển đổi dữ liệu thành các entity Category
      const categoriesToSave = newCategoriesToCreate.map((data) => {
        const category = this.create({
          id: data.id || uuidv4(), // Nếu id không được cung cấp, tự sinh UUID
          name: data.name,
          description: data.description,
          coverImage: data.coverImage,
        });
        // Chỉ set parentId nếu nó tồn tại và không phải chuỗi rỗng
        if (data.parentId && data.parentId !== '') {
          category.parentId = data.parentId;
        }
        return category;
      });

      const savedNewCategories = await this.save(categoriesToSave);
      addedCategories.push(...savedNewCategories);
    }

    return {
      addedCategories: addedCategories,
      addedCount: addedCategories.length,
    };
  }
}
