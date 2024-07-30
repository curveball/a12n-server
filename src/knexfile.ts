import { getSettings } from './database.js';
import './env.js';

const settings = getSettings();

export default {

  development: settings,

};
