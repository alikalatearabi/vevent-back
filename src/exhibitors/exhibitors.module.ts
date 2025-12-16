import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { ExhibitorsService } from './exhibitors.service';
import { ExhibitorsController } from './exhibitors.controller';
import { ExhibitorsAdminController } from './exhibitors.controller.admin';

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [ExhibitorsService],
  controllers: [ExhibitorsController, ExhibitorsAdminController],
  exports: [ExhibitorsService],
})
export class ExhibitorsModule {}
