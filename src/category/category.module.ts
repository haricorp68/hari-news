import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategorySearchService } from './category-search.service';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';
import { ElasticModule } from '../elastic/elastic.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), ElasticModule],
  controllers: [CategoryController],
  providers: [CategoryService, CategorySearchService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {}
