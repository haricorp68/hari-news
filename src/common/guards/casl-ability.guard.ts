import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
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
    const { action, resource } =
      this.reflector.get(CHECK_ABILITY_KEY, context.getHandler()) || {};
    if (!action || !resource) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;
    const body = request.body;
    const method = request.method;

    console.log('=== CASL GUARD DEBUG ===');
    console.log('Action:', action);
    console.log('Resource:', resource);
    console.log('Method:', method);
    console.log('User from request:', user);
    console.log('Params:', params);
    console.log('Body:', body);

    // Lấy policies cho user và role
    const userId = user.userId || user.id;
    console.log(
      '🔍 ~ canActivate ~ src/common/guards/casl-ability.guard.ts:39 ~ user:',
      user,
    );

    console.log(
      '🔍 ~ canActivate ~ src/common/guards/casl-ability.guard.ts:39 ~ userId:',
      userId,
    );

    const userPolicies = await this.policyService.getPoliciesForUser(userId);
    console.log(
      '🔍 ~ canActivate ~ src/common/guards/casl-ability.guard.ts:34 ~ userPolicies:',
      userPolicies,
    );

    const rolePolicies = user.role
      ? await this.policyService.getPoliciesForRole(user.role)
      : [];
    console.log(
      '🔍 ~ canActivate ~ src/common/guards/casl-ability.guard.ts:51 ~ rolePolicies:',
      rolePolicies,
    );
    const policies = [...userPolicies, ...rolePolicies];
    console.log('Policies found for user:', policies);

    const ability = defineAbilityFor(user, policies);
    console.log('Ability built:', ability);

    // Chuẩn bị resource object dựa trên HTTP method và context
    let resourceObj: any = { __caslSubjectType__: resource };

    if (resource === 'user') {
      if (method === 'GET' && params.id) {
        // GET specific user - check access to specific user
        resourceObj = { id: +params.id, __caslSubjectType__: 'user' };
      } else if (method === 'GET' && !params.id) {
        // GET users list - check access to user resource type
        resourceObj = { __caslSubjectType__: 'user' };
      } else if (method === 'POST') {
        // CREATE user - check access to user resource type
        resourceObj = { ...body, __caslSubjectType__: 'user' };
      } else if (method === 'PATCH' && params.id) {
        // UPDATE specific user - check access to specific user
        resourceObj = { id: +params.id, ...body, __caslSubjectType__: 'user' };
      } else if (method === 'DELETE' && params.id) {
        // DELETE specific user - check access to specific user
        resourceObj = { id: +params.id, __caslSubjectType__: 'user' };
      }
    }
    // Có thể mở rộng cho các resource khác tương tự

    console.log('Resource object to check:', resourceObj);

    const canAccess = ability.can(action, resourceObj);
    console.log('Can access result:', canAccess);
    console.log('=== END DEBUG ===');

    if (!canAccess) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }
    return true;
  }
}
