import hb from 'handlebars';
import { getSetting } from './server-settings.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

type Params = {
  [key: string]: any;
};
type Template = (parameters?: Params) => string;

const templates: Map<string, Template> = new Map();

export function render(name: string, params?: Params, renderLayoutWrapper = true): string {

  const layoutTemplate = getTemplate('layout');
  const pageTemplate = getTemplate(name);

  const newParams = {};
  Object.assign(newParams, params, {
    appName: 'Auth API',
    logoUrl: getSetting('logo_url')
  });

  if (renderLayoutWrapper) {
    return layoutTemplate({
      ...newParams,
      body: pageTemplate(newParams)
    });
  } else {
    return pageTemplate(newParams);
  }

}


export function getTemplate(name: string): Template {

  // Don't cache in dev
  if (process.env.NODE_ENV !== 'production') {
    return loadTemplate(name);
  }

  if (!templates.has(name)) {
    templates.set(name, loadTemplate(name));
  }

  return templates.get(name)!;

}

export function loadTemplate(name: string): Template {

  const template = hb.compile(
    readFileSync(
      dirname(fileURLToPath(import.meta.url)) +
      '/../templates/' + name + '.hbs', 'utf-8')
  );

  return template;

}
