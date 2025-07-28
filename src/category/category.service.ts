// src/category/category.service.ts
import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategorySearchService,
  CategorySearchResult,
} from './category-search.service';
import { v4 as uuidv4 } from 'uuid'; // Import uuid library
import { INITIAL_APP_CONFIG } from 'src/common/config/initial-config';

@Injectable()
export class CategoryService implements OnModuleInit {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categorySearchService: CategorySearchService,
  ) {}

  async onModuleInit() {
    this.logger.log(
      'CategoryService initialized. Seeding default categories...',
    );

    const defaultCategoriesConfig = INITIAL_APP_CONFIG.defaultCategories;

    if (!defaultCategoriesConfig || defaultCategoriesConfig.length === 0) {
      this.logger.log('No default categories configured to seed.');
      return;
    }

    try {
      const { addedCategories, addedCount } =
        await this.categoryRepository.createManyIfNotExists(
          defaultCategoriesConfig,
        );

      if (addedCount > 0) {
        this.logger.log(
          `Successfully added ${addedCount} new default categories: ${addedCategories.map((cat) => cat.name).join(', ')}`,
        );
        // Index các category mới được thêm vào Elasticsearch
        for (const category of addedCategories) {
          await this.categorySearchService.indexCategory(category);
        }
      } else {
        this.logger.log(
          'No new default categories were added as they already exist.',
        );
      }
    } catch (error) {
      this.logger.error('Failed to seed default categories:', error.stack);
    }
    this.logger.log('Default categories seeding finished.');
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = new Category();
    category.id = createCategoryDto.id || uuidv4(); // Nếu ID không được cung cấp, tự sinh UUID
    category.name = createCategoryDto.name;

    if (createCategoryDto.description) {
      category.description = createCategoryDto.description;
    }

    if (createCategoryDto.coverImage) {
      category.coverImage = createCategoryDto.coverImage;
    }

    if (createCategoryDto.parentId && createCategoryDto.parentId !== '') {
      category.parentId = createCategoryDto.parentId;
    }

    const savedCategory = await this.categoryRepository.save(category);

    await this.categorySearchService.indexCategory(savedCategory);

    return savedCategory;
  }

  // ... (các phương thức khác không thay đổi)
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Kiểm tra name unique nếu có update name
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });
      if (existingCategory && existingCategory.id !== id) {
        throw new Error('Category name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);

    try {
      await this.categoryRepository.save(category);
      // Trả về category đầy đủ sau khi update
      const updatedCategory = await this.findOne(id);

      // Update Elasticsearch
      await this.categorySearchService.updateCategory(updatedCategory);

      return updatedCategory;
    } catch (error) {
      if (
        error.code === '23505' &&
        error.constraint === 'UQ_8b0be371d28245da6e4f4b61878'
      ) {
        throw new Error('Category name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);

    // Delete from Elasticsearch
    await this.categorySearchService.deleteCategory(id);
  }

  async findByParentId(parentId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId },
    });
  }

  async findRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parentId: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async searchByName(name: string): Promise<CategorySearchResult[]> {
    return this.categorySearchService.searchByName(name);
  }

  async autocomplete(query: string): Promise<Category[]> {
    return this.categorySearchService.autocomplete(query);
  }

  async syncAllCategories(): Promise<void> {
    try {
      // Lấy tất cả categories từ database
      const categories = await this.categoryRepository.find();

      // Bulk index vào Elasticsearch
      await this.categorySearchService.bulkIndexCategories(categories);

      this.logger.log(
        `Synced ${categories.length} categories to Elasticsearch`,
      );
    } catch (error) {
      this.logger.error('Error syncing categories:', error);
      throw error;
    }
  }

  async reindexAllCategories(): Promise<void> {
    try {
      // Lấy tất cả categories từ database
      const categories = await this.categoryRepository.find();

      // Reindex toàn bộ
      await this.categorySearchService.reindexAllCategories(categories);

      this.logger.log(`Reindexed ${categories.length} categories`);
    } catch (error) {
      this.logger.error('Error reindexing categories:', error);
      throw error;
    }
  }
}
