import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewscrawlService } from '../services/newscrawl.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('crawl')
export class NewscrawlController {
  constructor(private readonly newscrawlService: NewscrawlService) {}

  @UseGuards(JwtAuthGuard)
  @Get('vnexpress')
  async crawlAI(
    @CurrentUser() user, // Đảm bảo bạn có decorator này để lấy user
    @Query('catePath') catePath: string,
    @Query('categoryId') categoryId?: string,
    @Query('tags') tags?: string,
  ) {
    if (!catePath) {
      throw new BadRequestException('Thiếu catePath');
    }

    // Split the comma-separated tags string into an array, if it exists
    const tagsArray = tags ? tags.split(',') : undefined;

    return this.newscrawlService.crawlVnExpressCategory(
      user.userId, // Truyền userId vào service
      catePath,
      categoryId,
      tagsArray,
    );
  }

  @Get('detail')
  async getDetail(@Query('link') link: string) {
    if (!link) {
      throw new BadRequestException('Thiếu link bài viết');
    }

    const data = await this.newscrawlService.crawlArticleDetail(link);
    return data;
  }
}
