import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Event date: 27 Azar 1404 = December 18, 2025
const EVENT_DATE = '2025-12-18';
const TIMEZONE = 'Asia/Tehran';
const LOCATION = 'Amirkabir University of Technology (Tehran Polytechnic)';

async function seedHrAnalyticsEvent() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📅 Creating HR Analytics Event for Registration');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📅 Event Date: ${EVENT_DATE} (27 Azar 1404)`);
  console.log(`📍 Location: ${LOCATION}`);
  console.log('');

  try {
    // Get or create an admin user for createdBy
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a temporary admin user...');
      // Create a minimal admin user if none exists
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@vevent.temp',
          passwordHash: await argon2.hash('temp123'),
          firstname: 'Admin',
          lastname: 'User',
          phone: '09123456789',
          role: 'ADMIN'
        }
      });
      console.log('✅ Created temporary admin user');
    }

    // Check if event already exists
    const existingEvent = await prisma.event.findFirst({
      where: {
        name: 'hr-analytics-event-2025',
        deletedAt: null
      }
    });

    if (existingEvent) {
      console.log('ℹ️  HR Analytics event already exists. Updating price...');
      // Update the existing event with price
      const updatedEvent = await prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          price: 50000000,
          currency: 'IRR'
        }
      });
      console.log(`   ID: ${updatedEvent.id}`);
      console.log(`   Title: ${updatedEvent.title}`);
      console.log(`   Price: ${updatedEvent.price} ${updatedEvent.currency}`);
      console.log(`   Start: ${updatedEvent.start}`);
      console.log(`   End: ${updatedEvent.end}`);
      console.log(`   Published: ${updatedEvent.published}`);
      console.log('');
      return updatedEvent;
    }

    // Create the main event that spans the entire day
    // From 8:15 AM to 5:30 PM (opening to closing)
    const eventStart = new Date(`${EVENT_DATE}T08:15:00+03:30`);
    const eventEnd = new Date(`${EVENT_DATE}T17:30:00+03:30`);

    const event = await prisma.event.create({
      data: {
        name: 'hr-analytics-event-2025',
        title: 'رویداد تحلیل‌گری منابع انسانی',
        description: 'رویداد یک روزه تحلیل‌گری منابع انسانی با حضور شرکت‌های پیشرو در صنعت',
        start: eventStart,
        end: eventEnd,
        timezone: TIMEZONE,
        location: LOCATION,
        timed: true,
        published: true, // Must be true for people to see and register
        createdById: adminUser.id,
        price: 55000000,
        currency: 'IRR'
      }
    });

    // Add basic tags for the event
    const tags = ['تحلیل‌گری منابع انسانی', 'HR Analytics'];
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName, title: tagName }
      });
      
      await prisma.tagOnEvent.upsert({
        where: {
          tagId_eventId: {
            tagId: tag.id,
            eventId: event.id
          }
        },
        update: {},
        create: {
          tagId: tag.id,
          eventId: event.id
        }
      });
    }

    console.log('✅ Created HR Analytics event:');
    console.log(`   ID: ${event.id}`);
    console.log(`   Name: ${event.name}`);
    console.log(`   Title: ${event.title}`);
    console.log(`   Start: ${eventStart.toISOString()}`);
    console.log(`   End: ${eventEnd.toISOString()}`);
    console.log(`   Location: ${LOCATION}`);
    console.log(`   Published: ${event.published}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 HR Analytics Event Created Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Event is now available for registration');
    console.log('   Users can register via: POST /api/v1/events/{id}/register');
    console.log('');

    return event;

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during event creation:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedHrAnalyticsEvent();
}

export { seedHrAnalyticsEvent };

