import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { DiaRequestDto } from './app.dto';
import { TwilioService } from './twilio/twilio.service';

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
  recordingCompleted(): string {
    console.log('Recording completed');
    return '';
  }

  @Post(':id/call-status-changed')
  callStatusChanged(): string {
    console.log('Call status changed');
    return '';
  }

  @Post('dial')
  async dial(@Body() dto: DiaRequestDto) {
    const { phoneNumber, languageCode } = dto;
    return await this.twilioService.makeCall(phoneNumber, languageCode);
  }
}
