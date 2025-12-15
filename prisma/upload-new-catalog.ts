import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MinioService } from '../src/common/services/minio.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const minioService = app.get(MinioService);

  const fileName = 'HR2 Catalog New edit-5.pdf';
  const filePath = path.join(__dirname, '../src/assets', fileName);
  const folder = 'hr-event';
  const keyName = 'catalog.pdf'; // overwrite existing catalog file

  console.log(`Uploading ${fileName} to hr-event/${keyName}...`);
  const result = await minioService.uploadFileFromPath(filePath, folder, keyName, 'application/pdf');
  console.log('Done. URL:', result.url);

  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
