import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioService } from './services/minio.service';
import { AssetService } from './services/asset.service';

@Global()
@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [MinioService, AssetService],
  exports: [MinioService, AssetService],
})
export class CommonModule {}
