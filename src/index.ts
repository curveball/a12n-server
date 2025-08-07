/**
 * If this package is used as a dependency, this package
 * exposes a middleware for curveball, and a load function that
 * needs to be called to initialize the server
 */

export { default as mainMw } from './main-mw.ts';
export { load as init } from './server-settings.ts';

/** db-types and src/types are internal to this project */
import './db-types.ts';

/** contract types */
export * from './api-types.ts';
