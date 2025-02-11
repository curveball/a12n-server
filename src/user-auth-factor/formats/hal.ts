import { HalFormsTemplate, HalResource } from 'hal-types';
import { User } from '../../types.ts';
import { UserAuthFactor } from '../types.ts';

export function collection(principal: User, authFactors: UserAuthFactor[]): HalResource  {

  const actions: Record<string, HalFormsTemplate> = {};

  if (!authFactors.some(f => f.type === 'totp')) {
    actions['add-totp'] = addTotpAction(principal);
  }

  return {
    _links: {
      self: {
        href: `${principal.href}/auth-factor`,
        title: 'Authentication factors for ' + principal.nickname,
      },
      up: {
        href: principal.href,
        title: 'Back to user',
      },
      item: authFactors.map( f => ({
        href: f.href,
        title: f.title,
      })),
    },
    total: authFactors.length,
    _templates: actions,
  };

}


function addTotpAction(principal: User): HalFormsTemplate {

  return {
    method: 'GET',
    target: `${principal.href}/auth-factor/new/totp`,
    title: 'Set up TOTP',
  };

}
