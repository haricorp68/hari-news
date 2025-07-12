import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserConfig } from './entities/user-config.entity';
import { UserConfigService } from './user-config.service';
import { UserConfigRepository } from './repositories/user-config.repository';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserConfig]), FollowModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserConfigService,
    UserRepository,
    UserConfigRepository,
  ],
  exports: [
    UserService,
    UserConfigService,
    UserRepository,
    UserConfigRepository,
  ],
})
export class UserModule {}
