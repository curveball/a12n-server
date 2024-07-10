import Controller from '@curveball/controller';
import { Context } from '@curveball/core';
import * as errors from '@curveball/http-errors';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const dir = dirname(fileURLToPath(import.meta.url));
const assetPath = dir + '/../../assets';
const webauthnPath = dir + '/../../node_modules/@simplewebauthn/browser/dist/bundle';

function readSync(basePath: string, filename: string) {
  return readFileSync(join(basePath, filename));
}

const files: Record<string, {data: Buffer, type: string}> = {
  'extra.css': {
    data: readSync(assetPath, 'extra.css'),
    type: 'text/css',
  },
  'form.css': {
    data: readSync(assetPath, 'form.css'),
    type: 'text/css',
  },
  'simplewebauthn-browser.min.js': {
    type: 'text/javascript',
    data: readSync(webauthnPath, 'index.umd.min.js'),
  },
  'webauthn.js': {
    type: 'text/javascript',
    data: readSync(assetPath, 'webauthn.js'),
  },

};

class BlobController extends Controller {

  get(ctx: Context) {

    if (ctx.params.filename in files) {
      ctx.response.type = files[ctx.params.filename].type;
      ctx.response.body = files[ctx.params.filename].data;
      return;
    }

    throw new errors.NotFound('File not found!');

  }

}

export default new BlobController();
