import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategorySearchService } from './category-search.service';
import { CategoryRepository } from './repositories/category.repository';
import { Category } from './entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    }),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategorySearchService, CategoryRepository],
  exports: [CategoryService],
})
export class CategoryModule {} 