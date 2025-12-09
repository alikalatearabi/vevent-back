import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking asset URLs in database...\n');
  
  const assets = await prisma.asset.findMany({
    take: 5,
    select: {
      id: true,
      url: true,
      type: true,
    },
  });

  console.log(`Found ${assets.length} sample assets:\n`);
  assets.forEach((asset, i) => {
    console.log(`${i + 1}. ${asset.url}`);
    console.log(`   Type: ${asset.type || 'N/A'}\n`);
  });

  const subdomainCount = await prisma.asset.count({
    where: {
      url: {
        startsWith: 'https://assets.veventexpo.ir',
      },
    },
  });

  const oldCount = await prisma.asset.count({
    where: {
      OR: [
        { url: { startsWith: 'http://185.149.192.60:9000' } },
        { url: { startsWith: 'https://185.149.192.60:9000' } },
        { url: { startsWith: 'http://minio:9000' } },
      ],
    },
  });

  console.log(`\n📊 Statistics:`);
  console.log(`   Assets with subdomain URL: ${subdomainCount}`);
  console.log(`   Assets with old URLs: ${oldCount}`);
  console.log(`   Total assets: ${await prisma.asset.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

