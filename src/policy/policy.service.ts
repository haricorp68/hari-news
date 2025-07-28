import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PolicyRepository } from './repositories/policy.repository';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { BlockedUserResponseDto } from './dto/blocked-user-response.dto';
import { INITIAL_APP_CONFIG } from 'src/common/config/initial-config';

@Injectable()
export class PolicyService implements OnModuleInit {
  constructor(private readonly policyRepository: PolicyRepository) {}
  private readonly logger = new Logger(PolicyService.name);
  async onModuleInit() {
    this.logger.log('Application initialization started...');

    // --- Khởi tạo Policy cho Superadmin ---
    const superAdminPolicyConfig = INITIAL_APP_CONFIG.superAdminPolicy;

    if (superAdminPolicyConfig) {
      try {
        const exists = await this.policyRepository.findOne({
          where: {
            subjectType: superAdminPolicyConfig.subjectType,
            subjectId: superAdminPolicyConfig.subjectId,
            action: superAdminPolicyConfig.action,
            resource: superAdminPolicyConfig.resource,
          },
        });

        if (!exists) {
          await this.policyRepository.save(superAdminPolicyConfig);
          this.logger.log('Policy for superadmin inited successfully!');
        } else {
          this.logger.log('Policy for superadmin already in use!');
        }
      } catch (error) {
        this.logger.error(
          'Failed to initialize Superadmin Policy:',
          error.stack,
        );
      }
    } else {
      this.logger.warn(
        'Superadmin policy configuration not found in initial-config.ts',
      );
    }

    this.logger.log('Application initialization finished.');
  }

  async findAll() {
    return this.policyRepository.find();
  }

  async findOne(id: string) {
    return this.policyRepository.findOne({ where: { id } });
  }

  async create(dto: CreatePolicyDto) {
    const policy = this.policyRepository.create(dto);
    return this.policyRepository.save(policy);
  }

  async update(id: string, dto: UpdatePolicyDto) {
    await this.policyRepository.update(id, dto);
    return this.policyRepository.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.policyRepository.delete(id);
  }

  async getPoliciesForUser(userId: string) {
    return this.policyRepository.find({
      where: [{ subjectType: 'user', subjectId: String(userId) }],
    });
  }

  async getPoliciesForRole(role: string) {
    const all = await this.policyRepository.find({
      where: [{ subjectType: 'role', subjectId: role }],
    });
    return all.filter(
      (p) => !p.condition || Object.keys(p.condition).length === 0,
    );
  }

  async createPolicy(data: {
    subjectType: string;
    subjectId: string;
    action: string;
    resource: string;
    condition?: Record<string, any>;
    description?: string;
  }) {
    return this.policyRepository.save({
      subjectType: data.subjectType,
      subjectId: data.subjectId,
      action: data.action,
      resource: data.resource,
      condition: data.condition ?? {},
      description: data.description,
    });
  }

  // Block User Methods
  async blockUser(
    blockerId: string,
    blockUserDto: BlockUserDto,
  ): Promise<BlockedUserResponseDto> {
    const { blockedId, reason } = blockUserDto;

    // Kiểm tra không block chính mình
    if (blockerId === blockedId) {
      throw new ConflictException('Cannot block yourself');
    }

    // Kiểm tra đã block chưa
    const existingBlock = await this.isUserBlocked(blockerId, blockedId);
    if (existingBlock) {
      throw new ConflictException('User already blocked');
    }

    const policy = await this.createPolicy({
      subjectType: 'user',
      subjectId: blockedId,
      action: 'read',
      resource: 'user',
      condition: {
        targetUserId: blockerId,
        blockType: 'user_block',
        reason,
        blockedAt: new Date().toISOString(),
      },
      description: `User ${blockedId} bị block bởi ${blockerId}`,
    });

    return this.mapToBlockedUserResponse(policy);
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const policy = await this.policyRepository.findOne({
      where: {
        subjectType: 'user',
        subjectId: blockedId,
        action: 'read',
        resource: 'user',
        condition: { targetUserId: blockerId },
      },
    });

    if (!policy) {
      throw new NotFoundException('Block relationship not found');
    }

    await this.policyRepository.remove(policy);
  }

  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const policy = await this.policyRepository.findOne({
      where: {
        subjectType: 'user',
        subjectId: blockedId,
        action: 'read',
        resource: 'user',
        condition: { targetUserId: blockerId },
      },
    });

    return !!policy;
  }

  async getBlockedUsers(blockerId: string): Promise<BlockedUserResponseDto[]> {
    const policies = await this.policyRepository.find({
      where: {
        subjectType: 'user',
        action: 'read',
        resource: 'user',
        condition: { targetUserId: blockerId },
      },
    });

    return policies.map((policy) => this.mapToBlockedUserResponse(policy));
  }

  async getUsersWhoBlockedMe(
    userId: string,
  ): Promise<BlockedUserResponseDto[]> {
    const policies = await this.policyRepository.find({
      where: {
        subjectType: 'user',
        subjectId: userId,
        action: 'read',
        resource: 'user',
      },
    });

    return policies
      .filter((policy) => policy.condition?.targetUserId)
      .map((policy) => this.mapToBlockedUserResponse(policy));
  }

  private mapToBlockedUserResponse(policy: any): BlockedUserResponseDto {
    return {
      id: policy.id,
      blockedUserId: policy.subjectId,
      reason: policy.condition?.reason,
      blockedAt: new Date(policy.condition?.blockedAt || policy.created_at),
      expiresAt: policy.condition?.expiresAt
        ? new Date(policy.condition.expiresAt)
        : undefined,
      user: policy.condition?.user || undefined,
    };
  }
}
