import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// HR Analytics Event names
const HR_ANALYTICS_EVENT_NAMES = [
  'opening-ceremony',
  'khalil-mirkhani-hr-analytics',
  'babak-alavi-ethics-ai',
  'hamkaran-system-data-driven-hr',
  'shahram-karimi-international-hr',
  'mitra-masoudi-hr-analytics-cost',
  'morning-networking',
  'panel-discussion-hr-analytics-challenges',
  'ml-hr-analytics-workshop',
  'irancell-employee-engagement',
  'digikala-people-experience',
  'afternoon-networking',
  'mohaimen-hr-data-strategic',
  'bank-melli-talent-analytics',
  'closing-ceremony'
];

// New event date: December 18, 2025
const NEW_EVENT_DATE = '2025-12-18';
const TIMEZONE = 'Asia/Tehran';

// Event time slots (in Tehran time, +03:30)
const EVENT_TIMES: Record<string, { start: string; end: string }> = {
  'opening-ceremony': { start: '08:15', end: '08:30' },
  'khalil-mirkhani-hr-analytics': { start: '08:30', end: '09:00' },
  'babak-alavi-ethics-ai': { start: '09:00', end: '09:30' },
  'hamkaran-system-data-driven-hr': { start: '09:35', end: '10:05' },
  'shahram-karimi-international-hr': { start: '10:05', end: '10:35' },
  'mitra-masoudi-hr-analytics-cost': { start: '10:35', end: '11:05' },
  'morning-networking': { start: '11:05', end: '11:30' },
  'panel-discussion-hr-analytics-challenges': { start: '11:30', end: '13:00' },
  'ml-hr-analytics-workshop': { start: '14:20', end: '15:00' },
  'irancell-employee-engagement': { start: '15:00', end: '15:30' },
  'digikala-people-experience': { start: '15:30', end: '16:00' },
  'afternoon-networking': { start: '16:00', end: '16:20' },
  'mohaimen-hr-data-strategic': { start: '16:20', end: '16:50' },
  'bank-melli-talent-analytics': { start: '16:50', end: '17:20' },
  'closing-ceremony': { start: '17:20', end: '17:30' }
};

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📅 Updating HR Analytics Event Dates to 2025');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Get all HR Analytics events
    const events = await prisma.event.findMany({
      where: {
        name: { in: HR_ANALYTICS_EVENT_NAMES },
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        title: true,
        start: true,
        end: true
      }
    });

    console.log(`📊 Found ${events.length} HR Analytics events to update`);
    console.log('');

    let updatedCount = 0;

    for (const event of events) {
      const eventTimes = EVENT_TIMES[event.name];
      if (!eventTimes) {
        console.log(`⚠️  No time slot found for: ${event.name}`);
        continue;
      }

      // Create new start and end dates with 2025 date
      const newStart = new Date(`${NEW_EVENT_DATE}T${eventTimes.start}:00+03:30`);
      const newEnd = new Date(`${NEW_EVENT_DATE}T${eventTimes.end}:00+03:30`);

      await prisma.event.update({
        where: { id: event.id },
        data: {
          start: newStart,
          end: newEnd
        }
      });

      updatedCount++;
      console.log(`✅ Updated: ${event.name}`);
      console.log(`   ${event.title}`);
      console.log(`   New time: ${newStart.toISOString()} - ${newEnd.toISOString()}`);
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Event Dates Update Completed!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Updated ${updatedCount} events to December 18, 2025`);
    console.log('');
    console.log('📋 Registration will now close on December 17, 2025');
    console.log('   (1 day before event start)');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during update:');
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

export { main as updateEventDatesTo2025 };

