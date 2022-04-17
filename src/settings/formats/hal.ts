import { SettingsRules, Settings } from '../../server-settings';
import { HalResource } from 'hal-types';

export function settings(settingsRules: SettingsRules, settings: Settings): HalResource {

  return {
    _links: {
      self: { href: '/settings', title: 'Server settings'},
    },
    settings: Object.fromEntries(
      Object.entries(settingsRules).map( ([key, value]:[string, any]) => {

        if (!value.isSecret) {
          value.value = settings[key as keyof Settings];
        }
        return [key, value];

      })
    ),
  };

}
