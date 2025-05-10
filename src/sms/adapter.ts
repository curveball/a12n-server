export abstract class SmsSenderAdapter {

  /**
   * Sends a text message.
   */
  abstract sendSmsMessage(phoneNumber: string, message: string): Promise<void>;

  /**
   * Checks if this adapter is configured. This is used to select the correct backend.
   *
   * It should return true if the adapter is configured. If no configuration exists,
   * it should return false.
   *
   * If configuration is provided but it's easy to determine that it's not valid, this
   * function should throw an error.
   */
  abstract isAvailable(): boolean;

}
