import { Injectable } from '@nestjs/common';
import { UserConfigRepository } from './repositories/user-config.repository';
import { UserConfig } from './entities/user-config.entity';

@Injectable()
export class UserConfigService {
  constructor(private readonly userConfigRepository: UserConfigRepository) {}

  async getUserConfig(
    userId: string,
  ): Promise<Omit<
    UserConfig,
    'passwordResetToken' | 'passwordResetExpiresAt'
  > | null> {
    const config = await this.userConfigRepository.findOne({
      where: { userId },
    });
    if (!config) return null;
    const { passwordResetToken, passwordResetExpiresAt, ...rest } = config;
    return rest;
  }

  async createUserConfig(userId: string): Promise<UserConfig> {
    const defaultConfig = this.userConfigRepository.create({
      userId,
    });
    return this.userConfigRepository.save(defaultConfig);
  }

  async updateUserConfig(
    userId: string,
    configData: Partial<UserConfig>,
  ): Promise<UserConfig | null> {
    const existingConfig = await this.userConfigRepository.findOne({
      where: { userId },
    });
    if (!existingConfig) {
      // Tạo config mới nếu chưa có
      const newConfig = this.userConfigRepository.create({
        userId,
        ...configData,
      });
      return this.userConfigRepository.save(newConfig);
    }

    await this.userConfigRepository.update({ userId }, configData);
    return this.userConfigRepository.findOne({ where: { userId } });
  }

  async deleteUserConfig(userId: string): Promise<boolean> {
    const result = await this.userConfigRepository.delete({ userId });
    return (result.affected || 0) > 0;
  }

  async getAllUserConfigs(): Promise<UserConfig[]> {
    return this.userConfigRepository.find();
  }

  async findByResetToken(token: string): Promise<UserConfig | null> {
    return this.userConfigRepository.findOne({
      where: { passwordResetToken: token },
    });
  }
}
