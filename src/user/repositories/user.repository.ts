import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Like } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: number) {
    return this.findOne({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.findOne({ where: { email } });
  }

  async findActive() {
    // Nếu có trường is_active thì filter, nếu không thì trả về tất cả
    return this.find();
  }

  async search(keyword: string) {
    return this.find({
      where: [
        { name: Like(`%${keyword}%`) },
        { email: Like(`%${keyword}%`) },
      ],
    });
  }

  async findWithRelations(id: number, relations: string[] = []) {
    return this.findOne({ where: { id }, relations });
  }

  async customSoftDelete(id: number) {
    // Nếu có trường is_deleted thì update, nếu không thì xóa cứng
    return this.delete(id);
  }

  async customRestore(id: number) {
    // Nếu có trường is_deleted thì update lại, nếu không thì không cần
    return this.findOne({ where: { id } });
  }

  async updateProfile(id: number, profile: Partial<User>) {
    await this.update(id, profile);
    return this.findOne({ where: { id } });
  }

  async findByName(name: string) {
    return this.findOne({ where: { name } });
  }

  // Ví dụ: lấy user kèm profile mở rộng (nếu có bảng profile riêng)
  // async findWithProfile(id: number) {
  //   return this.findOne({ where: { id }, relations: ['profile'] });
  // }
} 