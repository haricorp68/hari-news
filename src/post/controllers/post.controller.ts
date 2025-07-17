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
import { CreateUserFeedPostDto } from '../dto/create-user-feed-post.dto';
import { CreateCommunityFeedPostDto } from '../dto/create-community-feed-post.dto';
import { CreateCompanyFeedPostDto } from '../dto/create-company-feed-post.dto';
import { CreateUserNewsPostDto } from '../dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from '../dto/update-user-news-post.dto';
import { UserNewsPostResponseDto } from '../dto/user-news-post-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PostService } from '../services/post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // =========================
  // FEED ENDPOINTS (USER/COMMUNITY/COMPANY)
  // =========================

  /**
   * Tạo post user feed (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Post('user-feed')
  createUserFeed(@CurrentUser() user, @Body() dto: CreateUserFeedPostDto) {
    return this.postService.createUserFeedPost(user.userId, dto);
  }

  /**
   * Tạo post community feed (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Post('community-feed')
  createCommunityFeed(@Body() dto: CreateCommunityFeedPostDto) {
    return this.postService.createCommunityFeedPost(dto);
  }

  /**
   * Tạo post company feed (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Post('company-feed')
  createCompanyFeed(@Body() dto: CreateCompanyFeedPostDto) {
    return this.postService.createCompanyFeedPost(dto);
  }

  /**
   * Lấy danh sách user feed của chính mình (cần đăng nhập)
   */
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

  /**
   * Lấy danh sách user feed của user bất kỳ (public)
   */
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

  /**
   * Lấy chi tiết post user feed theo id (có thể public hoặc cần đăng nhập tuỳ guard)
   */
  @Get('user-feed/detail/:id')
  @UseGuards(JwtAuthGuard)
  getUserFeedPostDetail(@Param('id') id: string, @CurrentUser() user) {
    return this.postService.getUserFeedPostDetail(id, user.userId);
  }

  // =========================
  // NEWS ENDPOINTS (USER)
  // =========================

  /**
   * Tạo post user news (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Post('user-news')
  createUserNews(@CurrentUser() user, @Body() dto: CreateUserNewsPostDto) {
    return this.postService.createUserNewsPost(user.userId, dto);
  }

  /**
   * Lấy danh sách user news của chính mình (cần đăng nhập)
   */
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

  /**
   * Lấy danh sách user news của user bất kỳ (public)
   */
  @Get('user-news/:userId')
  getUserNewsPosts(
    @Param('userId') userId: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.postService.getUserNewsPosts(
      userId,
      undefined,
      Number(limit),
      Number(offset),
    );
  }

  /**
   * Lấy chi tiết đầy đủ của một bài postnews (user news)
   */
  @Get('user-news/detail/:postId')
  getUserNewsPostDetail(
    @Param('postId') postId: string,
    @Query('userId') userId?: string,
  ) {
    return this.postService.getUserNewsPostDetailById(postId, userId);
  }

  // =========================
  // SELF MANAGEMENT ENDPOINTS (USER TỰ QUẢN LÝ BÀI VIẾT CỦA MÌNH)
  // =========================

  /**
   * Sửa bài user news của chính mình (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Put('self/user-news/:id')
  updateSelfUserNews(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() dto: UpdateUserNewsPostDto,
  ) {
    return this.postService.updateUserNewsPost(user.userId, id, dto);
  }

  /**
   * Xoá bài user news của chính mình (cần đăng nhập)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('self/user-news/:id')
  deleteSelfUserNews(@CurrentUser() user, @Param('id') id: string) {
    return this.postService.deleteUserNewsPost(user.userId, id);
  }

  // =========================
  // ADMIN/OWNER MANAGEMENT ENDPOINTS (QUẢN LÝ BÀI VIẾT NGƯỜI KHÁC)
  // =========================

  /**
   * Sửa bài user news của user bất kỳ (cần quyền admin/owner)
   */
  @UseGuards(JwtAuthGuard)
  @Put('user-news/:userId/:id')
  updateUserNews(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserNewsPostDto,
  ) {
    return this.postService.updateUserNewsPost(userId, id, dto);
  }

  /**
   * Xoá bài user news của user bất kỳ (cần quyền admin/owner)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('user-news/:userId/:id')
  deleteUserNews(@Param('userId') userId: string, @Param('id') id: string) {
    return this.postService.deleteUserNewsPost(userId, id);
  }
}
