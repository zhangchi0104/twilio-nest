import { Test, TestingModule } from '@nestjs/testing';
import { Twilio } from './twilio.service';

describe('Twilio', () => {
  let provider: Twilio;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Twilio],
    }).compile();

    provider = module.get<Twilio>(Twilio);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
