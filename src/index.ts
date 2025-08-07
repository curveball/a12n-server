/**
 * If this package is used as a dependency, this package
 * exposes a middleware for curveball, and a load function that
 * needs to be called to initialize the server
 */

export { default as mainMw } from './main-mw.ts';
export { load as init } from './server-settings.ts';

// db-types.ts registers its types globally and is not explicitly
// imported by other files. This ensures that Typescript doesn't miss these.
import './db-types.ts';

/** contract types */
export * from './api-types.ts';
