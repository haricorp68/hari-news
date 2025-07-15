import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ReactionType } from './entities/reaction.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  async create(
    @CurrentUser() user,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    createReactionDto.userId = user.userId;
    return await this.reactionService.create(createReactionDto);
  }

  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  async toggleReaction(
    @CurrentUser() user,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    // Nếu không truyền type thì chỉ gỡ reaction nếu đã từng react
    if (!createReactionDto.type) {
      // Gọi service để gỡ reaction nếu có
      return await this.reactionService.removeUserReaction(user.userId, createReactionDto.postId);
    }
    // Nếu có type thì giữ logic cũ
    return await this.reactionService.toggleReaction({
      ...createReactionDto,
      userId: user.userId,
    });
  }

  @Get()
  findAll() {
    return this.reactionService.findAll();
  }

  @Get('post/:postId')
  async getReactionsByPost(
    @Param('postId') postId: string,
    @Query('type') type?: ReactionType,
  ) {
    return this.reactionService.findByPost({ postId, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    return this.reactionService.update(id, updateReactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionService.remove(id);
  }
}
