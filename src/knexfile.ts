import { getSettings } from './database.ts';
import './env.js';

const settings = await getSettings();

export default {

  development: settings,

};
