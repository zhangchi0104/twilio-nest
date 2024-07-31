import { Body, Controller, Get, Param, Post, RawBody } from '@nestjs/common';
import { AppService } from './app.service';
import { DiaRequestDto, GatherActionDto, RecordingActionDto } from './app.dto';
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

  @Post(':id/gather-completed')
  async gatherCompleted(
    @Param('id') sessionId: string,
    @Body() dto: GatherActionDto,
  ) {
    console.log('[AppController::gatherCompleted]', sessionId);
    const allState = JSON.parse(fs.readFileSync('./state.json', 'utf-8'));
    const sessionState = allState[sessionId] as SessionState;
    const newState = await this.twilioService.handleGatherCompleted(
      sessionState,
      dto.SpeechResult,
    );
    fs.writeFileSync(
      './state.json',
      JSON.stringify({ ...allState, [sessionId]: newState }),
    );
    const voiceResponse = new VoiceResponse();
    const gather = voiceResponse.gather({
      input: ['speech'],
      timeout: 5,
      numDigits: 1,
      action: process.env.TWILIO_WEBHOOK_URL + `/${sessionId}/gather-completed`,
      bargeIn: true,
      language:
        sessionState.languageCode === 'zh-CN'
          ? 'cmn-Hans-CN'
          : sessionState.languageCode,
    });
    gather.say(
      {
        language: newState.languageCode,
      },
      newState.nextQuestion || 'Thank you for your response',
    );

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
