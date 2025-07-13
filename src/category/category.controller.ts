import { Controller, Get, Post, Body, Param, Patch, Delete, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('search')
  searchByName(@Query('name') name: string) {
    return this.categoryService.searchByName(name);
  }

  @Get('autocomplete')
  autocomplete(@Query('q') query: string) {
    return this.categoryService.autocomplete(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Get('parent/:parentId')
  findByParentId(@Param('parentId') parentId: string) {
    return this.categoryService.findByParentId(parentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Post('sync')
  syncAllCategories() {
    return this.categoryService.syncAllCategories();
  }

  @Post('reindex')
  reindexAllCategories() {
    return this.categoryService.reindexAllCategories();
  }
} 