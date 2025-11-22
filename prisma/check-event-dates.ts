import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      title: true,
      start: true,
      end: true,
      createdAt: true,
      published: true
    },
    orderBy: { start: 'asc' },
    take: 5
  });

  const now = new Date();
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📅 Event Dates Check');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(`Current Date/Time: ${now.toISOString()}`);
  console.log(`Current Date/Time (Local): ${now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' })}`);
  console.log('\n');

  for (const event of events) {
    const registrationEnd = new Date(event.start.getTime() - 24 * 60 * 60 * 1000); // 1 day before event start
    const registrationStart = new Date(event.createdAt);
    const registrationOpen = now >= registrationStart && now <= registrationEnd;
    
    console.log(`Event: ${event.name}`);
    console.log(`  Title: ${event.title}`);
    console.log(`  Start: ${event.start.toISOString()} (${event.start.toLocaleString('en-US', { timeZone: 'Asia/Tehran' })})`);
    console.log(`  End: ${event.end.toISOString()} (${event.end.toLocaleString('en-US', { timeZone: 'Asia/Tehran' })})`);
    console.log(`  Created: ${event.createdAt.toISOString()}`);
    console.log(`  Published: ${event.published}`);
    console.log(`  Registration Start: ${registrationStart.toISOString()}`);
    console.log(`  Registration End: ${registrationEnd.toISOString()} (1 day before event start)`);
    console.log(`  Registration Open: ${registrationOpen ? '✅ YES' : '❌ NO'}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main();

