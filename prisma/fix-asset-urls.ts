import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAssetUrls() {
  console.log('Starting to fix asset URLs...');
  
  // Get all assets that need fixing
  const httpsAssets = await prisma.asset.findMany({
    where: {
      url: {
        startsWith: 'https://185.149.192.60:9000',
      },
    },
  });

  const minioAssets = await prisma.asset.findMany({
    where: {
      url: {
        startsWith: 'http://minio:9000',
      },
    },
  });

  console.log(`Found ${httpsAssets.length} assets with https:// URLs`);
  console.log(`Found ${minioAssets.length} assets with internal minio:9000 URLs`);

  const totalToUpdate = httpsAssets.length + minioAssets.length;

  if (totalToUpdate === 0) {
    console.log('No assets to update.');
    return;
  }

  let updated = 0;

  // Fix HTTPS URLs
  for (const asset of httpsAssets) {
    const newUrl = asset.url.replace('https://185.149.192.60:9000', 'http://185.149.192.60:9000');
    
    await prisma.asset.update({
      where: { id: asset.id },
      data: { url: newUrl },
    });
    
    updated++;
    if (updated % 10 === 0) {
      console.log(`Updated ${updated}/${totalToUpdate} assets...`);
    }
  }

  // Fix internal minio:9000 URLs
  for (const asset of minioAssets) {
    const newUrl = asset.url.replace('http://minio:9000', 'http://185.149.192.60:9000');
    
    await prisma.asset.update({
      where: { id: asset.id },
      data: { url: newUrl },
    });
    
    updated++;
    if (updated % 10 === 0) {
      console.log(`Updated ${updated}/${totalToUpdate} assets...`);
    }
  }

  console.log(`✅ Successfully updated ${updated} asset URLs`);
  console.log(`   - Fixed ${httpsAssets.length} HTTPS URLs`);
  console.log(`   - Fixed ${minioAssets.length} internal minio:9000 URLs`);
}

fixAssetUrls()
  .catch((e) => {
    console.error('Error fixing asset URLs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

