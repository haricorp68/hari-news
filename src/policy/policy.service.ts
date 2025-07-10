import { Injectable, OnModuleInit } from '@nestjs/common';
import { PolicyRepository } from './repositories/policy.repository';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PolicyService implements OnModuleInit {
  constructor(private readonly policyRepository: PolicyRepository) {}

  async onModuleInit() {
    // Tạo policy cao nhất cho superadmin nếu chưa có
    const exists = await this.policyRepository.findOne({
      where: {
        subjectType: 'role',
        subjectId: 'superadmin',
        action: 'manage',
        resource: 'all',
      },
    });
    if (!exists) {
      await this.policyRepository.save({
        subjectType: 'role',
        subjectId: 'superadmin',
        action: 'manage',
        resource: 'all',
        condition: {},
        description: 'Superadmin toàn quyền',
      });
      console.log('Policy for supper admin inited successfully!');
    } else {
      console.log('Policy for supper admin already in use!');
    }
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

  async getPoliciesForUser(userId: string | string) {
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
}
