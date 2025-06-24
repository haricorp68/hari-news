import { AbilityBuilder, Ability } from '@casl/ability';

export function defineAbilityFor(user: any, policies: any[]) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  for (const policy of policies) {
    if (policy.condition) {
      can(policy.action, policy.resource, policy.condition);
    } else {
      can(policy.action, policy.resource);
    }
  }

  return build();
} 