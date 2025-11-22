import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// HR Analytics Event names to keep
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

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🗑️  Deleting Events (Keeping HR Analytics Only)');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // First, get all events
    const allEvents = await prisma.event.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    console.log(`📊 Total events found: ${allEvents.length}`);

    // Filter events to delete (not in HR Analytics list)
    const eventsToDelete = allEvents.filter(
      event => !HR_ANALYTICS_EVENT_NAMES.includes(event.name)
    );

    console.log(`✅ HR Analytics events to keep: ${allEvents.length - eventsToDelete.length}`);
    console.log(`🗑️  Events to delete: ${eventsToDelete.length}`);
    console.log('');

    if (eventsToDelete.length === 0) {
      console.log('✅ No events to delete. All events are HR Analytics events.');
      console.log('');
      return;
    }

    // Show events that will be deleted
    if (eventsToDelete.length > 0) {
      console.log('📋 Events to be deleted:');
      console.log('─────────────────────────────────────────────────');
      eventsToDelete.forEach(event => {
        console.log(`  - ${event.name}: ${event.title}`);
      });
      console.log('');
    }

    // Get event IDs to delete
    const eventIdsToDelete = eventsToDelete.map(e => e.id);

    // Note: Related data will be cascade deleted automatically:
    // - EventSpeaker (onDelete: Cascade)
    // - TagOnEvent (onDelete: Cascade)
    // - AssetOnEvent (onDelete: Cascade)
    // - Attendee (onDelete: Cascade)
    // - ConnectionRequest (onDelete: Cascade)
    // - Payment (onDelete: Cascade)

    // Delete the events themselves
    console.log('🗑️  Deleting events and related data...');
    const deletedEvents = await prisma.event.deleteMany({
      where: {
        id: {
          in: eventIdsToDelete
        }
      }
    });
    console.log(`✅ Deleted ${deletedEvents.count} events`);
    console.log('');

    // Verify remaining events
    const remainingEvents = await prisma.event.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        title: true
      }
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Deletion Completed Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Remaining events: ${remainingEvents.length}`);
    console.log('');
    
    if (remainingEvents.length > 0) {
      console.log('📋 Remaining events:');
      console.log('─────────────────────────────────────────────────');
      remainingEvents.forEach(event => {
        console.log(`  ✓ ${event.name}: ${event.title}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during deletion:');
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

export { main as deleteOtherEvents };

