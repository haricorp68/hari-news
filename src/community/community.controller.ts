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
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CreateCommunityRoleDto } from './dto/create-community-role.dto';
import { UpdateCommunityRoleDto } from './dto/update-community-role.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: { userId: number },

    @Body() createCommunityDto: CreateCommunityDto,
  ) {
    console.log(
      '🔍 ~ create ~ src/community/community.controller.ts:26 ~ user:',
      user,
    );
    return this.communityService.create({
      ...createCommunityDto,
      creatorId: user.userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query() query: any,
  ) {
    const { page: _p, pageSize: _ps, ...filters } = query;
    const { data, total, lastPage } = await this.communityService.paginate({
      page,
      pageSize,
      filters,
    });
    return {
      data,
      message: 'Lấy danh sách community thành công!',
      metadata: {
        page: Number(page),
        pageSize: Number(pageSize),
        total,
        totalPages: lastPage,
        filters,
      },
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communityService.update(+id, updateCommunityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(+id);
  }

  @Get(':communityId/roles')
  async getRoles(@Param('communityId') communityId: string) {
    return this.communityService.findAllCommunityRoles(+communityId);
  }

  @Get('role/:id')
  async getRole(@Param('id') id: string) {
    return this.communityService.findOneCommunityRole(+id);
  }

  @Post('role')
  async createRole(@Body() createCommunityRoleDto: CreateCommunityRoleDto) {
    return this.communityService.createCommunityRole(createCommunityRoleDto);
  }

  @Patch('role/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateDto: UpdateCommunityRoleDto,
  ) {
    return this.communityService.updateCommunityRole(+id, updateDto);
  }

  @Delete('role/:id')
  async deleteRole(@Param('id') id: string) {
    return this.communityService.removeCommunityRole(+id);
  }
}
