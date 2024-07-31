import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DiaRequestDto, RecordingActionDto } from './app.dto';
import { TwilioService } from './twilio/twilio.service';
import fs from 'node:fs';

import { SessionState, SessionStatus } from './app.types';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post(':id/recording-completed')
  async recordingCompleted(
    @Param('id') sessionId: string,
    @Body() dto: RecordingActionDto,
  ) {
    console.log('[AppController::recordingCompleted]', dto.RecordingUrl);
    console.log('[AppController::recordingCompleted]', sessionId);
    const allState = JSON.parse(fs.readFileSync('./state.json', 'utf-8'));
    const sessionState = allState[sessionId] as SessionState;
    const newState = await this.twilioService.handleRecodingCompleted(
      sessionState,
      dto.RecordingUrl,
    );
    fs.writeFileSync(
      './state.json',
      JSON.stringify({ ...allState, [sessionId]: newState }),
    );
    const voiceResponse = new VoiceResponse();
    voiceResponse.say(
      {
        language: newState.languageCode,
      },
      newState.nextQuestion || 'Thank you for your response',
    );
    voiceResponse.record({
      timeout: 1,
      playBeep: true,
      finishOnKey: '#',
      action:
        process.env.TWILIO_WEBHOOK_URL + `/${sessionId}/recording-completed`,
      method: 'POST',
      recordingStatusCallback:
        process.env.TWILIO_WEBHOOK_URL +
        `/${sessionId}/recording-status-changed`,
      // recordingStatusCallbackEvent: 'completed',
    });

    return voiceResponse.toString();
  }

  @Post(':id/call-status-changed')
  callStatusChanged(): string {
    console.log('Call status changed');
    return '';
  }

  @Post(':id/recording-status-changed')
  recordingStatusChanged(): string {
    console.log('Recording status changed');
    return '';
  }
  @Post('dial')
  async dial(@Body() dto: DiaRequestDto) {
    fs.writeFileSync(
      './state.json',
      JSON.stringify({
        '123456': {
          status: 'dialed',
          languageCode: dto.languageCode,
        },
      }),
    );
    const { phoneNumber, languageCode } = dto;
    await this.twilioService.makeCall('123456', phoneNumber, languageCode);
    return { sessionId: '123456' };
  }
}
