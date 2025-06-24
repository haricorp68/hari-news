import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_ABILITY_KEY } from '../decorators/check-ability.decorator';
import { PolicyService } from '../../policy/policy.service';
import { defineAbilityFor } from '../casl-ability.factory';

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyService: PolicyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { action, resource } = this.reflector.get(CHECK_ABILITY_KEY, context.getHandler()) || {};
    if (!action || !resource) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    const body = request.body;

    // Lấy policies cho user
    const policies = await this.policyService.getPoliciesForUser(user.id);
    const ability = defineAbilityFor(user, policies);

    // Chuẩn bị resource object (tuỳ use-case, có thể lấy từ params/body)
    let resourceObj: any = {};
    if (resource === 'user') {
      resourceObj = { id: +params.id, ...body, __caslSubjectType__: 'user' };
    }
    // Có thể mở rộng cho các resource khác

    if (!ability.can(action, resourceObj)) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
} 