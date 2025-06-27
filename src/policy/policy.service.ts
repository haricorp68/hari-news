import { Injectable } from '@nestjs/common';
import { PolicyRepository } from './repositories/policy.repository';

@Injectable()
export class PolicyService {
  constructor(private readonly policyRepository: PolicyRepository) {}

  async getPoliciesForUser(userId: number | string) {
    return this.policyRepository.find({
      where: [{ subjectType: 'user', subjectId: String(userId) }],
    });
  }

  async getPoliciesForRole(role: string) {
    return this.policyRepository.find({
      where: [{ subjectType: 'role', subjectId: role }],
    });
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
