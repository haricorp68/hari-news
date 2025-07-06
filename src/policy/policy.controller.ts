import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PolicyService } from './policy.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('policy')
export class PolicyController {
  constructor(private readonly policyService: PolicyService) {}

  @Get()
  async findAll() {
    const data = await this.policyService.findAll();
    return { message: 'Lấy danh sách policy thành công!', data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.policyService.findOne(+id);
    return { message: 'Lấy policy thành công!', data };
  }

  @Post()
  async create(@Body() body: CreatePolicyDto) {
    const data = await this.policyService.create(body);
    return { message: 'Tạo policy thành công!', data };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdatePolicyDto) {
    const data = await this.policyService.update(+id, body);
    return { message: 'Cập nhật policy thành công!', data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.policyService.remove(+id);
    return { message: 'Xóa policy thành công!', data: null };
  }
}
