import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserConfigService } from './user-config.service';
import { Like } from 'typeorm';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userConfigService: UserConfigService,
  ) {}

  async onModuleInit() {
    const userById = await this.userRepository.findOne({ where: { id: 1 } });
    const userByEmail = await this.userRepository.findByEmail(
      'superadmin@hari.com',
    );
    if (!userById && !userByEmail) {
      const hashedPassword = await bcrypt.hash('123qwe', 10);
      const superadmin = this.userRepository.create({
        id: 1,
        email: 'superadmin@hari.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'superadmin',
        isActive: true,
        isVerified: true,
        status: 'active',
      });
      await this.userRepository.save(superadmin);
      await this.userConfigService.createUserConfig(1);
      console.log('Super admin created successfully!');
    } else {
      console.log('Super admin already used!');
    }
  }

  async create(createUserDto: CreateUserDto) {
    const userData = createUserDto;
    const existing = await this.userRepository.findByEmail(userData.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);

    // Tạo config mặc định cho user mới
    await this.userConfigService.createUserConfig(saved.id);

    const { password, ...result } = saved;
    return result;
  }

  async findAll() {
    const users = await this.userRepository.findActive();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(
    id: number,
    withPassword = false,
  ): Promise<User | Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    if (withPassword) return user;
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async findByEmail(
    email: string,
    withPassword = false,
  ): Promise<User | Omit<User, 'password'> | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;
    if (withPassword) return user;
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  async remove(id: number) {
    await this.userRepository.delete(id);
    return { deleted: true };
  }

  async paginate({
    page = 1,
    pageSize = 10,
    filters = {},
  }: {
    page?: number;
    pageSize?: number;
    filters?: any;
  }) {
    const where: any = {};

    // Xây dựng where clause động
    if (filters.email) {
      where.email = Like(`%${filters.email}%`);
    }
    if (filters.name) {
      where.name = Like(`%${filters.name}%`);
    }
    if (filters.phone) {
      where.phone = Like(`%${filters.phone}%`);
    }
    if (filters.city) {
      where.city = Like(`%${filters.city}%`);
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.isVerified !== undefined) {
      where.isVerified =
        filters.isVerified === 'true' || filters.isVerified === true;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.gender) {
      where.gender = filters.gender;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { id: 'DESC' },
    });
    return {
      data: users.map(({ password, ...rest }) => rest),
      total,
    };
  }
}
