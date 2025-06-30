import { Injectable } from '@nestjs/common';
import { UserConfigRepository } from './repositories/user-config.repository';
import { UserConfig } from './entities/user-config.entity';

@Injectable()
export class UserConfigService {
  constructor(private readonly userConfigRepository: UserConfigRepository) {}

  async getUserConfig(userId: number): Promise<UserConfig | null> {
    return this.userConfigRepository.findOne({ where: { userId } });
  }

  async createUserConfig(userId: number): Promise<UserConfig> {
    const defaultConfig = this.userConfigRepository.create({
      userId,
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        privacyLevel: 'public',
        theme: 'light',
      },
      socialLinks: {},
      twoFactorEnabled: false,
    });
    return this.userConfigRepository.save(defaultConfig);
  }

  async updateUserConfig(
    userId: number,
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

  async updatePreferences(
    userId: number,
    preferences: any,
  ): Promise<UserConfig | null> {
    const config = await this.getUserConfig(userId);
    if (!config) {
      return this.updateUserConfig(userId, { preferences });
    }

    const updatedPreferences = { ...config.preferences, ...preferences };
    return this.updateUserConfig(userId, { preferences: updatedPreferences });
  }

  async updateSocialLinks(
    userId: number,
    socialLinks: any,
  ): Promise<UserConfig | null> {
    const config = await this.getUserConfig(userId);
    if (!config) {
      return this.updateUserConfig(userId, { socialLinks });
    }

    const updatedSocialLinks = { ...config.socialLinks, ...socialLinks };
    return this.updateUserConfig(userId, { socialLinks: updatedSocialLinks });
  }

  async enableTwoFactor(
    userId: number,
    secret: string,
  ): Promise<UserConfig | null> {
    return this.updateUserConfig(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    });
  }

  async disableTwoFactor(userId: number): Promise<UserConfig | null> {
    return this.updateUserConfig(userId, {
      twoFactorSecret: undefined,
      twoFactorEnabled: false,
    });
  }

  async deleteUserConfig(userId: number): Promise<boolean> {
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
