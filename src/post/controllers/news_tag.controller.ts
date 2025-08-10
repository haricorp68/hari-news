import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
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
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.newsTagService.findAllWithPagination(
      Number(page),
      Number(pageSize),
    );
  }

  @Get('search')
  search(
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.newsTagService.search(q, Number(page), Number(pageSize));
  }

  @Get('autocomplete')
  autocomplete(
    @Query('q') q: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    return this.newsTagService.autocomplete(q, Number(page), Number(pageSize));
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

  @Post('reindex')
  async reindex() {
    await this.newsTagService.reindexAllTags();
    return { message: 'Reindexing all news tags has been initiated.' };
  }
}
