import { Optional } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { LanguageCode } from './app.types';

export class DiaRequestDto {
  @IsNotEmpty()
  phoneNumber: string;

  @IsEnum(LanguageCode)
  languageCode: LanguageCode = LanguageCode.en_US;
}

export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND_API = 'outbound-api',
  OUTBOUND_DIAL = 'outbound-dial',
}

export class TwilioBaseReuqest {
  @IsString()
  CallSid: string;
  @IsString()
  AccountSid: string;
  @IsString()
  From: string;
  @IsString()
  To: string;

  @IsEnum(CallStatus)
  CallStatus: CallStatus;
  @IsString()
  ApiVersion: string;
  //   @IsEnum(CallDirection)
  //   Direction: CallDirection;
  //   @IsString()
  //   ForwardedFrom: string;

  //   @IsString()
  //   CallToken: string;
}

export class RecordingActionDto extends TwilioBaseReuqest {
  @IsString()
  RecordingUrl: string;
  @IsString()
  RecordingDuration: string;
}
