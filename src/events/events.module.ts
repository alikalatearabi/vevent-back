import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { AttendeesController } from '../attendees/attendees.controller';

@Module({
  imports: [PrismaModule],
  providers: [EventsService],
  controllers: [EventsController, AttendeesController],
  exports: [EventsService],
})
export class EventsModule {}
