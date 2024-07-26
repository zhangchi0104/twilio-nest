import { Injectable } from '@nestjs/common';
import createClient, { Twilio } from 'twilio';
@Injectable()
export class TwilioService {
  private twlio: Twilio;
  constructor() {
    this.twlio = createClient(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  public async makeCall(phoneNumber: string, languageCode: string = 'en_US') {}
}
