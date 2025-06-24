import { SetMetadata } from '@nestjs/common';

export const CHECK_ABILITY_KEY = 'check_ability';
export const CheckAbility = (action: string, resource: string) =>
  SetMetadata(CHECK_ABILITY_KEY, { action, resource }); 