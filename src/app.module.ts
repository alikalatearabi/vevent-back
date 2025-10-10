import { Module, Controller, Get } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExhibitorsModule } from './exhibitors/exhibitors.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';

@Controller()
class AppController {
  @Get()
  getRoot() {
    return { message: 'Hello from vevent-back' };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}

@Module({
  imports: [AuthModule, UsersModule, ExhibitorsModule, EventsModule, ProductsModule, PrismaModule],
  controllers: [AppController]
})
export class AppModule {}
