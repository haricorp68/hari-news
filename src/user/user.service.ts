import { Injectable, BadRequestException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return result;
  }

  async findAll() {
    const users = await this.userRepository.findActive();
    return users.map(({ password, ...rest }) => rest);
  }

  async findOne(id: number, withPassword = false): Promise<User | Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;
    if (withPassword) return user;
    const { password, ...result } = user;
    return result as Omit<User, 'password'>;
  }

  async findByEmail(email: string, withPassword = false): Promise<User | Omit<User, 'password'> | null> {
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

  async paginate({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }) {
    const [users, total] = await this.userRepository.findAndCount({
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
