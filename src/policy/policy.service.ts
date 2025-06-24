import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './policy.entity';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
  ) {}

  async getPoliciesForUser(userId: number | string) {
    return this.policyRepository.find({
      where: [
        { subjectType: 'user', subjectId: String(userId) },
      ],
    });
  }

  async getPoliciesForRole(role: string) {
    return this.policyRepository.find({
      where: [
        { subjectType: 'role', subjectId: role },
      ],
    });
  }
}
