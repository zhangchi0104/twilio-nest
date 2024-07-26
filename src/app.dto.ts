import { Optional } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';

export class DiaRequestDto {
  @IsNotEmpty()
  phoneNumber: string;

  @Optional()
  languageCode: string = 'en-US';
}
