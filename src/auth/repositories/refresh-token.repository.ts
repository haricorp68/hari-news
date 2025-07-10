import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull, LessThan, MoreThan } from 'typeorm';
import { RefreshToken, RefreshTokenType } from '../entities/refresh-token.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }

  async createAndSave(params: {
    user: User;
    token: string;
    device?: string;
    ip?: string;
    userAgent?: string;
    type?: RefreshTokenType;
    expiredAt?: Date;
  }): Promise<RefreshToken> {
    const entity = this.create({
      user: params.user,
      token: params.token,
      device: params.device,
      ip: params.ip,
      userAgent: params.userAgent,
      type: params.type || RefreshTokenType.LOCAL,
      expiredAt: params.expiredAt,
    });
    return this.save(entity);
  }

  async findByUser(userId: string, type: RefreshTokenType = RefreshTokenType.LOCAL) {
    return this.find({
      where: {
        user: { id: userId },
        type,
      },
      relations: ['user'],
    });
  }

  async findValidToken(userId: string, refreshTokenHash: string, type: RefreshTokenType = RefreshTokenType.LOCAL) {
    return this.findOne({
      where: {
        user: { id: userId },
        token: refreshTokenHash,
        type,
        revokedAt: IsNull(),
        expiredAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
  }

  async findByTokenHash(refreshTokenHash: string) {
    return this.findOne({ where: { token: refreshTokenHash } });
  }

  async revokeToken(id: string) {
    return this.update(id, { revokedAt: new Date() });
  }

  async revokeAllForUser(userId: string, type: RefreshTokenType = RefreshTokenType.LOCAL) {
    return this.update(
      { user: { id: userId }, type, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async removeExpiredTokens(now: Date = new Date()) {
    return this.delete({ expiredAt: LessThan(now) });
  }
} 