import { Injectable } from '@nestjs/common';
import OpenAI, { toFile } from 'openai';

import { LanguageCode, SessionState, SessionStatus } from 'src/app.types';
import twilio, { twiml, Twilio } from 'twilio';
import { CHAT_COMPLETION_PROMPT } from './twilio.constants';
import { ChatCompletionMessageParam } from 'openai/resources';
import { translations } from 'src/translations';
const VoiceResposne = twiml.VoiceResponse;
@Injectable()
export class TwilioService {
  private twlio: Twilio;
  private openai: OpenAI;
  constructor() {
    this.twlio = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  public async makeCall(
    sessionId: string,
    phoneNumber: string,
    languageCode: LanguageCode,
  ) {
    const response = new VoiceResposne();
    console.log(languageCode);
    response.say(
      {
        language: languageCode,
      },
      translations[languageCode].greeting,
    );
    response.record({
      timeout: 5,
      playBeep: true,
      action:
        process.env.TWILIO_WEBHOOK_URL + `/${sessionId}/recording-completed`,
      method: 'POST',
    });
    // response.play("....")
    return this.twlio.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phoneNumber,
      twiml: response.toString(),
    });
  }

  async handleRecodingCompleted(state: SessionState, recordingUrl: string) {
    let recordingPromise = await fetch(recordingUrl, {
      headers: {
        Authorization: this.basicAuthHeader,
      },
    });
    // Poll for the recording to be ready
    // TODO: improve this with recording status callback
    while (recordingPromise.status !== 200) {
      console.log(
        '[TwilioService::handleRecordingCompleted] Recording File Status',
        recordingPromise.status,
      );
      await this.sleepAsync(100);
      recordingPromise = await fetch(recordingUrl, {
        headers: {
          Authorization: this.basicAuthHeader,
        },
      });
    }

    console.time('[Time] whisper-transcription');
    const transcription = await this.openai.audio.transcriptions.create({
      file: await toFile(recordingPromise, 'recording.wav'),
      model: 'whisper-1',
    });
    console.log(
      '[TwilioService::handleRecordingCompleted] Transcription',
      transcription.text,
    );
    console.timeEnd('[Time] whisper-transcription');
    const history: ChatCompletionMessageParam[] = state.chatHistory
      ? [...state.chatHistory, { role: 'user', content: transcription.text }]
      : [
          {
            role: 'system',
            content: CHAT_COMPLETION_PROMPT,
          },
          {
            role: 'user',
            content: transcription.text,
          },
        ];
    console.time('[Time] openai-chat-completion');
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: history,
    });
    console.timeEnd('[Time] openai-chat-completion');
    const gptMsg = response.choices[0]
      .message satisfies ChatCompletionMessageParam;
    history.push(gptMsg);
    console.log(
      '[TwilioService::handleRecordingCompleted] GPT Response',
      gptMsg,
    );
    return {
      ...state,
      chatHistory: history,
      nextQuestion: gptMsg.content,
      status:
        state.status === SessionStatus.DIALED
          ? SessionStatus.PENDING_FOR_MORE_INFO
          : SessionStatus.COMPLETED,
    };
  }

  private get basicAuthHeader() {
    return `Basic ${Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString('base64')}`;
  }
  async sleepAsync(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
