import { getSettings } from './database.ts';
import './env.js';

const settings = getSettings();

export default {

  development: settings,

};
