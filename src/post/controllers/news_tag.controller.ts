import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { NewsTagService } from '../services/news_tag.service';
import { CreateNewsTagDto, UpdateNewsTagDto } from '../dto/news-tag.dto';

@Controller('news-tags')
export class NewsTagController {
  constructor(private readonly newsTagService: NewsTagService) {}

  @Post()
  create(@Body() dto: CreateNewsTagDto) {
    return this.newsTagService.create(dto);
  }

  @Get()
  findAll() {
    return this.newsTagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsTagService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNewsTagDto) {
    return this.newsTagService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.newsTagService.remove(id);
  }
} 