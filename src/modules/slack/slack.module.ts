import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppModule } from 'src/app.module';
import { AppService } from 'src/app.service';

import { ConfigService } from 'src/shared/config.service';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

@Module({
  imports:[],
  controllers: [SlackController],
  providers:[ConfigService, SlackService]
})
export class SlackModule {}
