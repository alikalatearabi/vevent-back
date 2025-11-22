import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Event date: December 18, 2025 (27 Azar 1404)
const EVENT_DATE = '2025-12-18';
const TIMEZONE = 'Asia/Tehran';
const LOCATION = 'Amirkabir University of Technology (Tehran Polytechnic)';

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📅 Creating Main HR Analytics Event');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Get admin user for createdBy
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@vevent.com' } });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run the main seed script first.');
    }

    // Check if main event already exists
    const existingMainEvent = await prisma.event.findFirst({
      where: {
        name: 'hr-analytics-event-2025',
        deletedAt: null
      }
    });

    if (existingMainEvent) {
      console.log('ℹ️  Main HR Analytics event already exists');
      console.log(`   Name: ${existingMainEvent.name}`);
      console.log(`   Title: ${existingMainEvent.title}`);
      console.log('');
      return existingMainEvent;
    }

    // Create main event that spans the entire day
    // From opening ceremony (8:15 AM) to closing ceremony (5:30 PM)
    const mainEventStart = new Date(`${EVENT_DATE}T08:15:00+03:30`);
    const mainEventEnd = new Date(`${EVENT_DATE}T17:30:00+03:30`);

    const mainEvent = await prisma.event.create({
      data: {
        name: 'hr-analytics-event-2025',
        title: 'رویداد تحلیل گری منابع انسانی',
        description: 'Human Resources Analytics Event - Full Day Conference featuring workshops, presentations, and panel discussions on HR analytics in Iranian companies.',
        start: mainEventStart,
        end: mainEventEnd,
        timezone: TIMEZONE,
        location: LOCATION,
        timed: true,
        published: true,
        createdById: adminUser.id
      }
    });

    // Add tags
    const tags = ['تحلیلگری منابع انسانی', 'HR Analytics', 'رویداد', 'Event'];
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      });
      
      await prisma.tagOnEvent.create({
        data: {
          tagId: tag.id,
          eventId: mainEvent.id
        }
      });
    }

    console.log('✅ Created main HR Analytics event:');
    console.log(`   Name: ${mainEvent.name}`);
    console.log(`   Title: ${mainEvent.title}`);
    console.log(`   Start: ${mainEventStart.toISOString()}`);
    console.log(`   End: ${mainEventEnd.toISOString()}`);
    console.log(`   Location: ${LOCATION}`);
    console.log('');

    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Main Event Created Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📋 This main event represents the entire HR Analytics');
    console.log('   event day with all sessions included.');
    console.log('');

    return mainEvent;

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during creation:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as createMainHrAnalyticsEvent };

