/**
 * If this package is used as a dependency, this package
 * exposes a middleware for curveball, and a load function that
 * needs to be called to initialize the server
 */
export { default as mainMw } from './main-mw.js';
export { load as init } from './server-settings.js';

import './db-types';
