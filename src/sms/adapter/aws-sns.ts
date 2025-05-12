import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SmsSenderAdapter } from '../adapter.js';
import dbg from 'debug';

const debug = dbg('sms:aws-sns');

export class AwsSnsSmsSender extends SmsSenderAdapter {

  /**
   * Sends a text message.
   */
  async sendSmsMessage(phoneNumber: string, message: string): Promise<void> {

    const snsClient = this.getClient();
    const command = new PublishCommand({
      Message: message,
      PhoneNumber: phoneNumber, // E.164 format, e.g., "+15555555555"
    });

    debug('Sending message to phone number:', phoneNumber);
    const response = await snsClient.send(command);
    debug('Message sent. Message ID:', response.MessageId);

  }

  /**
   * Checks if this adapter is configured. This is used to select the correct backend.
   *
   * It should return true if the adapter is configured. If no configuration exists,
   * it should return false.
   *
   * If configuration is provided but it's easy to determine that it's not valid, this
   * function should throw an error.
   */
  isAvailable(): boolean {

    return process.env.SMS_ADAPTER === 'aws-sns';

  }

  private client: SNSClient | null = null;

  private getClient(): SNSClient {
    if (!this.client) {
      this.client = new SNSClient(); // Replace with your region
    }
    return this.client;
  }

}
