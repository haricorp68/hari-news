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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';

@Controller('policy')
export class PolicyController {
  constructor(
    private readonly policyService: PolicyService,
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
  ) {}

  @Get()
  async findAll() {
    return this.policyRepository.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.policyRepository.findOne({ where: { id: +id } });
  }

  @Post()
  async create(@Body() body: Partial<Policy>) {
    const policy = this.policyRepository.create(body);
    return this.policyRepository.save(policy);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Policy>) {
    await this.policyRepository.update(+id, body);
    return this.policyRepository.findOne({ where: { id: +id } });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.policyRepository.delete(+id);
    return { deleted: true };
  }
}
