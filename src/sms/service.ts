import { requireSetting } from '../server-settings.ts';
import { SmsSenderAdapter } from './adapter.ts';
import { AwsSnsSmsSender } from './adapter/aws-sns.ts';

function getAppName(): string {

  return requireSetting('app_name');

};

/**
 * Sends a text message to a phone number.
 */
export async function sendTextMessage(phoneNumber: string, message: string): Promise<void> {

  await getAdapter().sendSmsMessage(phoneNumber, message);

}

export async function sendVerificationCode(phoneNumber: string, code: string): Promise<void> {

  return sendTextMessage(
    phoneNumber,
    `Your ${getAppName()} verification code is ${code}.`
  );

}

let adapter: SmsSenderAdapter | null = null;

function getAdapter() {

  if (!adapter) {
    const adapters = [
      new AwsSnsSmsSender(),
    ];

    for(const item of adapters) {
      if (item.isAvailable()) {
        adapter = item;
      }
    }
  }
  if (!adapter) {
    throw new Error('No SMS adapter is configured. Make sure to set the SMS_ADAPTER environment variable to one of the supported adapters.');
  }
  return adapter;

}
