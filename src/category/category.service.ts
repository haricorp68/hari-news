import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategorySearchService,
  CategorySearchResult,
} from './category-search.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categorySearchService: CategorySearchService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Xử lý parentId: nếu là chuỗi rỗng thì không set parentId
    const category = new Category();
    category.name = createCategoryDto.name;

    if (createCategoryDto.description) {
      category.description = createCategoryDto.description;
    }

    if (createCategoryDto.coverImage) {
      category.coverImage = createCategoryDto.coverImage;
    }

    // Chỉ set parentId nếu không phải chuỗi rỗng
    if (createCategoryDto.parentId && createCategoryDto.parentId !== '') {
      category.parentId = createCategoryDto.parentId;
    }

    const savedCategory = await this.categoryRepository.save(category);

    // Index vào Elasticsearch
    await this.categorySearchService.indexCategory(savedCategory);

    return savedCategory;
  }

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

      console.log(`Synced ${categories.length} categories to Elasticsearch`);
    } catch (error) {
      console.error('Error syncing categories:', error);
      throw error;
    }
  }

  async reindexAllCategories(): Promise<void> {
    try {
      // Lấy tất cả categories từ database
      const categories = await this.categoryRepository.find();

      // Reindex toàn bộ
      await this.categorySearchService.reindexAllCategories(categories);

      console.log(`Reindexed ${categories.length} categories`);
    } catch (error) {
      console.error('Error reindexing categories:', error);
      throw error;
    }
  }
}
