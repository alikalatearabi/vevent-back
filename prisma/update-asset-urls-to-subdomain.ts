import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const oldBaseUrls = [
    'http://185.149.192.60:9000',
    'https://185.149.192.60:9000',
    'http://minio:9000',
  ];
  const newBaseUrl = 'https://assets.veventexpo.ir';
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔄 Updating Asset URLs to Subdomain');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`New base URL: ${newBaseUrl}`);
  console.log('');

  let totalUpdated = 0;

  for (const oldBaseUrl of oldBaseUrls) {
    const assets = await prisma.asset.findMany({
      where: {
        url: {
          startsWith: oldBaseUrl,
        },
      },
    });

    if (assets.length === 0) {
      console.log(`No assets found with base URL: ${oldBaseUrl}`);
      continue;
    }

    console.log(`Found ${assets.length} assets with base URL: ${oldBaseUrl}`);
    
    let updated = 0;
    for (const asset of assets) {
      const newUrl = asset.url.replace(oldBaseUrl, newBaseUrl);
      await prisma.asset.update({
        where: { id: asset.id },
        data: { url: newUrl },
      });
      updated++;
    }

    console.log(`✅ Updated ${updated} assets from ${oldBaseUrl}`);
    totalUpdated += updated;
    console.log('');
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`✅ Total updated: ${totalUpdated} asset URLs`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

