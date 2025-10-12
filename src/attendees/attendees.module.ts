import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendeesController } from './attendees.controller';
import { AttendeesService } from './attendees.service';
import { ConnectionRequestService } from './connection-request.service';

@Module({
  imports: [PrismaModule],
  controllers: [AttendeesController],
  providers: [AttendeesService, ConnectionRequestService],
  exports: [AttendeesService, ConnectionRequestService]
})
export class AttendeesModule {}
