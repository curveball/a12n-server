import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import { UnsupportedMediaType } from '@curveball/http-errors';

import { PrincipalEdit, UserEdit } from '../../api-types.ts';
import * as principalIdentityService from '../../principal-identity/service.ts';
import { PrincipalService } from '../../principal/service.ts';
import * as privilegeService from '../../privilege/service.ts';
import { UserInfo } from '../../types.ts';
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

    ctx.response.body = userHal.item(
      principal,
      principalPrivileges.getAll(),
      hasControl,
      hasPassword,
      currentUserPrivileges,
      await principalService.findGroupsForPrincipal(principal),
      await principalIdentityService.findByPrincipal(principal),
      await userService.findUserInfoByUser(principal)
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

    const user = await principalService.findByExternalId(ctx.params.id);

    if (user.type === 'user') {
      user.active = !!ctx.request.body.active;
      user.nickname = ctx.request.body.nickname;
    }

    await principalService.save(user);
    ctx.status = 204;

  }

  async putJson(ctx: Context) {

    ctx.request.validate<UserEdit>(
      'https://curveballjs.org/schemas/a12nserver/user-edit.json'
    );
    const principalService = new PrincipalService(ctx.privileges);

    const user = await principalService.findByExternalId(ctx.params.id);

    if (user.type === 'user') {
      user.active = !!ctx.request.body.active;
      user.nickname = ctx.request.body.nickname;

      // One thing to keep in mind is that there's really 3 cases for the new properties:
      const userInfo = await userService.findUserInfoByUser(user);
      // 1. They have a value, and you want to update the database.
      // Check if the PUT request is for JSON, if so, we want to update the userInfo object
      if (userInfo != null && ctx.request.is('json')) {
        const newFields = ctx.request.body.userInfo;
        if (!newFields) return;

        const updatedUserInfo: UserInfo = {
          ...userInfo,
          ...newFields,
          birthDate: newFields.birthDate ? new Date(newFields.birthDate) : null,
          address: newFields.address ? {
            locality: newFields.address.locality ?? null,
            region: newFields.address.region ?? null,
            postalCode: newFields.address.postalCode ?? null,
            country: newFields.address.country ?? null
          } : null
        };
        await userService.updateUserInfo(user, updatedUserInfo);
      }

      // 2. They are set to null, which means we want to clear the value in the database
      const nullProperties = Object.keys(userInfo).filter(key => userInfo[key as keyof UserInfo] === null);
      if (nullProperties.length > 0) {
        await userService.deleteFieldsFromUserInfo(user, nullProperties);
      }

      // 3. It's undefined, in which case we want to keep the old value. Remember that we don't
      //    have control over clients and we need to have some kind of backwards compatibility,
      //    at least for a few versions. So an old client might know about these new properties
      //    and shouldn't inadvertently clear them.
      const undefinedProperties = Object.keys(userInfo).filter(key => !userInfo[key as keyof UserInfo]);
      if (undefinedProperties.length > 0) {
        // not sure what to do here... which is the old value?
      }
    }

    await principalService.save(user);
    ctx.status = 204;
  }
}

export default new UserController();
