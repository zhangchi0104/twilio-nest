import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Twilio } from './twilio/twilio.service';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [TwilioModule],
  controllers: [AppController],
  providers: [AppService, Twilio],
})
export class AppModule {}
