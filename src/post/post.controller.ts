import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreateUserFeedPostDto } from './dto/create-user-feed-post.dto';
import { CreateCommunityFeedPostDto } from './dto/create-community-feed-post.dto';
import { CreateCompanyFeedPostDto } from './dto/create-company-feed-post.dto';
import { CreateUserNewsPostDto } from './dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from './dto/update-user-news-post.dto';
import { UserNewsPostResponseDto } from './dto/user-news-post-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  @Post('user-news')
  createUserNews(@CurrentUser() user, @Body() dto: CreateUserNewsPostDto) {
    return this.postService.createUserNewsPost(user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('self/user-feed')
  getSelfUserFeed(
    @CurrentUser() user,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserFeedPosts(
      user.userId,
      Number(limit),
      Number(offset),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('self/user-news')
  getSelfUserNews(
    @CurrentUser() user,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserSelfNewsPosts(
      user.userId,
      Number(limit),
      Number(offset),
    );
  }

  // Public endpoints for reading user news posts
  @Get('user-news/:userId')
  getUserNewsPosts(
    @Param('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserNewsPosts(
      userId,
      Number(limit),
      Number(offset),
    );
  }

  // Public endpoint for reading user feed posts by userId
  @Get('user-feed/:userId')
  getUserFeedPosts(
    @Param('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserFeedPosts(
      userId,
      Number(limit),
      Number(offset),
    );
  }

  // Public endpoint: lấy chi tiết post user feed theo id
  @Get('user-feed/detail/:id')
  @UseGuards(JwtAuthGuard)
  getUserFeedPostDetail(@Param('id') id: string, @CurrentUser() user) {
    return this.postService.getUserFeedPostDetail(id, user.userId);
  }

  // Self management endpoints
  @UseGuards(JwtAuthGuard)
  @Put('self/user-news/:id')
  updateSelfUserNews(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() dto: UpdateUserNewsPostDto,
  ) {
    return this.postService.updateUserNewsPost(user.userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('self/user-news/:id')
  deleteSelfUserNews(@CurrentUser() user, @Param('id') id: string) {
    return this.postService.deleteUserNewsPost(user.userId, id);
  }

  // Public management endpoints (for admin or owner)
  @UseGuards(JwtAuthGuard)
  @Put('user-news/:userId/:id')
  updateUserNews(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserNewsPostDto,
  ) {
    return this.postService.updateUserNewsPost(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('user-news/:userId/:id')
  deleteUserNews(@Param('userId') userId: string, @Param('id') id: string) {
    return this.postService.deleteUserNewsPost(userId, id);
  }
}
