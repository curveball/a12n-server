import { SettingsRules, Settings } from '../../server-settings.js';
import { stringify } from 'csv-stringify/sync';

export function settings(settingsRules: SettingsRules, settings: Settings): string {

  const settingsTable = Object.keys(settingsRules).map(key => {

    const rule = settingsRules[key as keyof Settings];
    const value = rule.isSecret ? null : settings[key as keyof Settings];

    return {
      name: key,
      ...rule,
      value,
    };

  });

  return stringify(settingsTable, {
    header: true,
    columns: {
      name: 'Name',
      value: 'Value',
      default: 'Default',
      fromDb: 'Settable in database',
      env: 'Environment variable name',
      isSecret: 'Secret',
    },
    cast: {
      boolean: v => v ? 'true' : 'false',
    }
  });

}
