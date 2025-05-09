import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as hal from '../formats/hal.ts';
import * as services from '../../services.ts';
import { PrincipalIdentityNewForm } from '../../api-types.ts';

class PrincipalIdentityForm extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');
    const identities = await services.principalIdentity.findByPrincipal(principal);

    if (ctx.auth.equals(principal) && !ctx.privileges.has('a12n:user:manage-identities')) {
      throw new Forbidden('You can only use this API for yourself, or if you have the \'a12n:user:manage-identities\'privilege');
    }

    ctx.response.body = hal.newForm(
      principal,
      identities,
    );

  }

  async post(ctx: Context) {

    ctx.request.validate<PrincipalIdentityNewForm>('https://curveballjs.org/schemas/a12nserver/principal-identity-new-form.json');

    const principalService = new services.principal.PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    await services.principalIdentity.create({
      uri: ctx.request.body.uri,
      principal: principal,
      isPrimary: false,
      isMfa: false,
      label: ctx.request.body.label ? ctx.request.body.label : null,
      markVerified: false,
    });

  }

}

export default new PrincipalIdentityForm();
