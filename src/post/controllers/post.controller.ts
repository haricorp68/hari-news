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
  BadRequestException,
} from '@nestjs/common';
import { CreateUserFeedPostDto } from '../dto/create-user-feed-post.dto';
import { CreateCommunityFeedPostDto } from '../dto/create-community-feed-post.dto';
import { CreateCompanyFeedPostDto } from '../dto/create-company-feed-post.dto';
import { CreateUserNewsPostDto } from '../dto/create-user-news-post.dto';
import { UpdateUserNewsPostDto } from '../dto/update-user-news-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PostService } from '../services/post.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/common/guards/jwt-optional.guard';

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
  @UseGuards(OptionalJwtAuthGuard)
  @Get('self/user-feed')
  getSelfUserFeed(
    @CurrentUser() user,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.getUserFeedPosts(
      user.userId,
      Number(page),
      Number(pageSize),
    );
  }

  /**
   * Lấy danh sách user feed của user bất kỳ (public)
   */
  @Get('user-feed/:userId')
  getUserFeedPosts(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.getUserFeedPosts(
      userId,
      Number(page),
      Number(pageSize),
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
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.getUserSelfNewsPosts(
      user.userId,
      Number(page),
      Number(pageSize),
    );
  }

  /**
   * Lấy danh sách user news của user bất kỳ (public)
   */
  @Get('user-news/:userId')
  getUserNewsPosts(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.postService.getUserNewsPosts(
      userId,
      Number(page),
      Number(pageSize),
    );
  }

  /**
   * Lấy chi tiết đầy đủ của một bài postnews (user news)
   */
  // @Get('user-news/detail/:postId')
  // @UseGuards(OptionalJwtAuthGuard)
  // getUserNewsPostDetail(@Param('postId') postId: string, @CurrentUser() user) {
  //   const userId = user?.userId || null; // Handle case when user is null
  //   return this.postService.getUserNewsPostDetailById(postId, userId);
  // }

  @Get('user-news/slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  getUserNewsPostDetailBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user,
  ) {
    const userId = user?.userId || null; // Handle case when user is null
    return this.postService.getUserNewsPostDetailBySlug(slug, userId);
  }

  @Get('user-news/detail/:identifier')
  @UseGuards(OptionalJwtAuthGuard)
  async getUserNewsPostDetailByIdentifier(
    @Param('identifier') identifier: string,
    @CurrentUser() user,
  ) {
    const userId = user?.userId || null;

    // Kiểm tra xem identifier là UUID hay slug
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (uuidRegex.test(identifier)) {
      // Nếu là UUID -> query by ID
      return this.postService.getUserNewsPostDetailById(identifier, userId);
    } else {
      // Nếu không phải UUID -> query by slug
      return this.postService.getUserNewsPostDetailBySlug(identifier, userId);
    }
  }

  /**
   * Lấy tất cả user news (public, có phân trang và filter)
   */
  @Get('news')
  getAllUserNews(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('tagIds') tagIds?: string[],
    @Query('categoryId') categoryId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('sortByInteraction') sortByInteraction?: string,
  ) {
    return this.postService.getAllUserNews(Number(page), Number(pageSize), {
      tagIds:
        tagIds && Array.isArray(tagIds)
          ? tagIds
          : tagIds
            ? [tagIds]
            : undefined,
      categoryId,
      fromDate,
      toDate,
      sortByInteraction: sortByInteraction === 'true',
    });
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

  @UseGuards(JwtAuthGuard)
  @Post('reindex-user-news')
  async triggerReindexUserNews() {
    return this.postService.reindexAllUserNewsPosts();
  }

  @Get('autocomplete-user-news')
  async autocompleteUserNews(@Query('query') query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Query parameter is required');
    }
    return this.postService.autocomplete(query);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('followed-user-feed')
  async getFollowedUserFeed(
    @CurrentUser() user,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    // Kiểm tra xem user có tồn tại và có userId không
    const userId = user && user.userId ? user.userId : null;

    return this.postService.getFollowedUserFeed(
      userId,
      Number(page),
      Number(pageSize),
    );
  }
}
