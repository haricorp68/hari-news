import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from './entities/policy.entity';
import { PolicyService } from './policy.service';
import { PolicyController } from './policy.controller';
import { PolicyRepository } from './repositories/policy.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [PolicyController],
  providers: [PolicyService, PolicyRepository],
  exports: [PolicyService, PolicyRepository],
})
export class PolicyModule {}
