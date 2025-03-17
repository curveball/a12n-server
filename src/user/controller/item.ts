import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { UnsupportedMediaType } from '@curveball/http-errors';

import { PrincipalEdit, UserEdit } from '../../api-types.ts';
import * as principalIdentityService from '../../principal-identity/service.ts';
import { PrincipalService } from '../../principal/service.ts';
import * as privilegeService from '../../privilege/service.ts';
import * as userHal from '../formats/hal.ts';
import * as userService from '../service.ts';

class UserController extends Controller {

  async get(ctx: Context) {

    const principalService = new PrincipalService(ctx.privileges);
    const principal = await principalService.findByExternalId(ctx.params.id, 'user');

    let hasControl = false;
    let hasPassword = false;
    const isAdmin = ctx.privileges.has('admin');

    if (ctx.auth.equals(principal)) {
      hasControl = true;
    } else if (isAdmin) {
      hasControl = true;
    }

    if (hasControl && principal.type === 'user') {
      hasPassword = await userService.hasPassword(principal);
    }

    const principalPrivileges = await privilegeService.get(principal);

    const currentUserPrivileges = ctx.privileges;
    const userInfo = await userService.findUserInfoByUser(principal);
    ctx.response.body = userHal.item(
      principal,
      principalPrivileges.getAll(),
      hasControl,
      hasPassword,
      currentUserPrivileges,
      await principalService.findGroupsForPrincipal(principal),
      await principalIdentityService.findByPrincipal(principal),
      userInfo ?? null
    );

  }

  async put(ctx: Context) {

    if (ctx.request.is('x-www-form-urlencoded')) {
      return this.putForm(ctx);
    } else if (ctx.request.is('json')) {
      return this.putJson(ctx);
    } else {
      throw new UnsupportedMediaType('Only application/x-www-form-urlencoded and application/json is accepted');
    }

  }

  async putForm(ctx: Context) {

    ctx.request.validate<PrincipalEdit>(
      'https://curveballjs.org/schemas/a12nserver/principal-edit.json'
    );
    const principalService = new PrincipalService(ctx.privileges);

    const user = await principalService.findByExternalId(ctx.params.id, 'user');
    await principalService.save(user);
    ctx.status = 204;

  }

  async putJson(ctx: Context) {

    ctx.request.validate<UserEdit>(
      'https://curveballjs.org/schemas/a12nserver/user-edit.json'
    );
    const body = ctx.request.body;
    const principalService = new PrincipalService(ctx.privileges);

    const user = await principalService.findByExternalId(ctx.params.id, 'user');

    user.active = !!ctx.request.body.active;
    user.nickname = ctx.request.body.nickname;

    const userInfo = await userService.findUserInfoByUser(user);

    if (userInfo != null && ctx.request.is('json')) {

      // Do the string keys first.
      const userInfoKeys = [
        'name',
        'locale',
        'givenName',
        'middleName',
        'familyName',
        'zoneinfo',
      ] as const;
      for(const key of userInfoKeys) {
        if (key in body && body[key] !== undefined) {
          userInfo[key] = body[key];
        }
      }
      if (body.birthdate !== undefined) {
        userInfo.birthdate = body.birthdate === null ? null : new Date(body.birthdate);
      }
      if (body.address !== undefined) {
        userInfo.address = body.address;
      }

      await userService.updateUserInfo(user, userInfo);
    }

    await principalService.save(user);
    ctx.status = 204;
  }
}

export default new UserController();
