import fs from 'fs';
import { default as handlebars } from 'handlebars';

type Params = { [key: string]: string };
type Template = (parameters?: Params) => string;

const templates: Map<string, Template> = new Map();

export function render(name: string, params?: Params): string {

  const layoutTemplate = getTemplate('layout');
  const pageTemplate = getTemplate(name);

  return layoutTemplate({
    ...params,
    body: pageTemplate(params)
  });

}


export function getTemplate(name: string): Template {

  // Don't cache in dev
  if (process.env.NODE_ENV !== 'production') {
    return loadTemplate(name);
  }

  if (!templates.has(name)) {
    templates.set(name, loadTemplate(name));
  }

  return templates.get(name);

}

export function loadTemplate(name: string): Template {

  const template = handlebars.compile(
    fs.readFileSync(__dirname + '/../templates/' + name + '.hbs', 'utf-8')
  );

  return template;

}
