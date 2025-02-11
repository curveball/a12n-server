import hb from 'handlebars';
import { getSetting } from './server-settings.ts';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

type Params = {
  [key: string]: any;
};
type Template = (parameters?: Params) => string;

const templates: Map<string, Template> = new Map();

/**
 * Renders a handlebars template
 */
export function render(name: string, params: Params, layout: 'minimal-form' | 'email'): string {

  const layoutTemplate = getTemplate('layout/' + layout);
  const pageTemplate = getTemplate(name);

  const newParams = {};
  Object.assign(newParams, params, {
    appName: getSetting('app_name'),
    logoUrl: getSetting('logo_url')
  });

  return layoutTemplate({
    ...newParams,
    body: pageTemplate(newParams)
  });

}

/**
 * Returns a template by name
 */
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

/**
 * Loads a template from disk
 */
export function loadTemplate(name: string): Template {

  const template = hb.compile(
    readFileSync(
      dirname(fileURLToPath(import.meta.url)) +
      '/../templates/' + name + '.hbs', 'utf-8')
  );

  return template;

}
