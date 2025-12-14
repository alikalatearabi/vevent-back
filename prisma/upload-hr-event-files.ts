import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MinioService } from '../src/common/services/minio.service';

async function uploadFiles() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const minioService = app.get(MinioService);

  console.log('Uploading HR Event files to MinIO...\n');

  // Define the files to upload
  const files = [
    {
      name: 'HR2 Catalog.pdf',
      key: 'hr-event/catalog.pdf',
      folder: 'hr-event',
    },
    {
      name: 'زمان بندی رویداد 1.jpg',
      key: 'hr-event/schedule-1.jpg',
      folder: 'hr-event',
    },
    {
      name: 'زمان بندی رویداد 2.jpg',
      key: 'hr-event/schedule-2.jpg',
      folder: 'hr-event',
    },
  ];

  const basePath = path.join(__dirname, '../src/assets');
  const results: Array<{ name: string; url: string; key: string }> = [];

  for (const file of files) {
    const filePath = path.join(basePath, file.name);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      continue;
    }

    try {
      console.log(`Uploading ${file.name}...`);
      const result = await minioService.uploadFileFromPath(
        filePath,
        file.folder,
        path.basename(file.key),
      );
      
      results.push({
        name: file.name,
        url: result.url,
        key: result.key,
      });
      
      console.log(`✅ Uploaded: ${result.url}\n`);
    } catch (error: any) {
      console.error(`❌ Error uploading ${file.name}: ${error.message}\n`);
    }
  }

  console.log('\n==================================================');
  console.log('Upload Summary:');
  console.log('==================================================\n');
  
  results.forEach((result) => {
    console.log(`${result.name}:`);
    console.log(`  Key: ${result.key}`);
    console.log(`  URL: ${result.url}\n`);
  });

  console.log(`Successfully uploaded: ${results.length}/${files.length} files`);

  await app.close();
}

uploadFiles()
  .then(() => {
    console.log('\n✓ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });

