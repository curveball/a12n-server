import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { BadRequest, Conflict, NotFound, UnprocessableContent } from '@curveball/http-errors';
import { HalResource } from 'hal-types';
import { User } from '../../../src/types.ts';
import { PrincipalNew } from '../../api-types.ts';
import * as services from '../../services.ts';
import * as hal from '../formats/hal.ts';

class UserCollectionController extends Controller {

  async get(ctx: Context) {

    const principalService = new services.principal.PrincipalService(ctx.privileges);

    const page = +ctx.request.query.page || 1;

    const paginatedResult = await principalService.search<User>('user', page);
    const users = paginatedResult.items;

    const embed = ctx.request.prefer('transclude').toString().includes('item') || ctx.query.embed?.includes('item');

    const embeddedUsers: HalResource[] = [];
    if (embed) {
      // Generate full HAL responses for each user.
      const isAdmin = ctx.privileges.has('admin');

      for (const user of users) {
        const hasControl = isAdmin || ctx.auth.equals(user);
        embeddedUsers.push(
          hal.item(
            user,
            (await services.privilege.get(user)).getAll(),
            hasControl,
            ctx.privileges,
            await principalService.findGroupsForPrincipal(user),
            await services.principalIdentity.findByPrincipal(user),
            await services.user.findUserInfoByUser(user)
          )
        );
      }
    }

    ctx.response.body = hal.collection(paginatedResult, embeddedUsers);

  }

  async post(ctx: Context) {

    ctx.request.validate<PrincipalNew>(
      'https://curveballjs.org/schemas/a12nserver/principal-new.json'
    );

    const identity = ctx.request.links.get('me')?.href;
    if (!identity) {
      throw new BadRequest('You must specify a link with rel "me", either via a HAL link or HTTP Link header');
    }

    const principalService = new services.principal.PrincipalService(ctx.privileges);

    if (!services.principal.isIdentityValid(identity)) {
      throw new UnprocessableContent('Invalid value for identity field. Must be a URI');
    }

    try {
      await principalService.findByIdentity(identity);
      throw new Conflict('User already exists');
    } catch (err) {
      if (!(err instanceof NotFound)) {
        throw err;
      }
    }

    const user = await principalService.save({
      nickname: ctx.request.body.nickname,
      type: ctx.request.body.type,
      active: true,
      createdAt: new Date(),
      modifiedAt: new Date(),
    });

    if (ctx.request.body.active !== undefined) {
      console.error('[ERROR] A API client used the "active" flag when creating a new user. This is deprecated behavior!');
    }

    await services.principalIdentity.create({
      principal: user,
      isPrimary: true,
      isMfa: false,
      uri: identity,
      label: null,

      // Deprecated feature.
      markVerified: ctx.request.body.active ?? false,
    });

    ctx.response.status = 201;
    ctx.response.headers.set('Location', user.href);
  }

}

export default new UserCollectionController();
