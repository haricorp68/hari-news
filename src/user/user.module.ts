import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { PolicyModule } from 'src/policy/policy.module';
import { UserConfig } from './entities/user-config.entity';
import { UserConfigService } from './user-config.service';
import { UserConfigController } from './user-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserConfig]), PolicyModule],
  controllers: [UserController, UserConfigController],
  providers: [UserService, UserConfigService, UserRepository],
  exports: [UserService, UserConfigService, UserRepository],
})
export class UserModule {}
