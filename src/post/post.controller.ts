import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreateUserFeedPostDto } from './dto/create-user-feed-post.dto';
import { CreateCommunityFeedPostDto } from './dto/create-community-feed-post.dto';
import { CreateCompanyFeedPostDto } from './dto/create-company-feed-post.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('user-feed')
  createUserFeed(@CurrentUser() user, @Body() dto: CreateUserFeedPostDto) {
    return this.postService.createUserFeedPost(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('community-feed')
  createCommunityFeed(@Body() dto: CreateCommunityFeedPostDto) {
    return this.postService.createCommunityFeedPost(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('company-feed')
  createCompanyFeed(@Body() dto: CreateCompanyFeedPostDto) {
    return this.postService.createCompanyFeedPost(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('self/user-feed')
  getSelfUserFeed(
    @CurrentUser() user,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserSelfFeedPosts(
      user.userId,
      Number(limit),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('self/user-feed/:id')
  getSelfUserFeedDetail(@CurrentUser() user, @Param('id') id: string) {
    return this.postService.getUserSelfFeedPostDetail(user.userId, Number(id));
  }
}
