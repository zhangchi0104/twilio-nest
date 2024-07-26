import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { DiaRequestDto } from './app.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Put('dial')
  dial(@Body() dto: DiaRequestDto): string {
    console.log('dto', dto);
    return '';
  }
}
