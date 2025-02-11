import { Controller, method, accept } from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import { getSettings, settingsRules } from '../server-settings.ts';
import * as hal from './formats/hal.ts';
import * as csv from './formats/csv.ts';

class SettingsController extends Controller {

  @method('GET')
  @accept('application/hal+json')
  async getJson(ctx: Context) {

    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }

    ctx.response.links.add({
      href: ctx.path,
      rel: 'alternate',
      type: 'text/csv'
    });

    ctx.response.body = hal.settings(settingsRules, getSettings());

  }

  @method('GET')
  @accept('csv')
  async getCsv(ctx: Context) {

    if (!ctx.privileges.has('admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }
    ctx.response.links.add({
      href: ctx.path,
      rel: 'alternate',
      type: 'application/hal+json'
    });

    ctx.response.type = 'text/csv';
    ctx.response.body = csv.settings(settingsRules, getSettings());

  }

}

export default new SettingsController();
