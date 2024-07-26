import { Injectable } from '@nestjs/common';
import twilio, { twiml, Twilio } from 'twilio';
const VoiceResposne = twiml.VoiceResponse;
@Injectable()
export class TwilioService {
  private twlio: Twilio;
  constructor() {
    this.twlio = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }
  public async makeCall(phoneNumber: string, languageCode: string = 'en_US') {
    const response = new VoiceResposne();
    response.say(
      'Hello Alex, this is a call from everyoung AI. You can answer your question after the beep. How are you today?',
    );
    response.record({
      timeout: 5,
      playBeep: true,
    });
    // response.play("....")
    return this.twlio.calls.create({
      from: process.env.TWILIO_PHONE_NO!,
      to: phoneNumber,
      twiml: response.toString(),
    });
  }
}
