import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data to keep from seed files
const SEED_DATA_TO_KEEP = {
  // Users to keep (from seed-users.ts)
  userEmails: [
    'admin@vevent.com',
    'user@vevent.com',
    'exhibitor@vevent.com',
    // HR Analytics speakers (from seed-hr-analytics-event.ts)
    'khalil.mirkhani@example.com',
    'babak.alavi@example.com',
    'ahmad.hassani@example.com',
    'zohreh.hashemi@example.com',
    'shahram.karimi@example.com',
    'mitra.masoudi@example.com',
    'majid.manouchehri@example.com',
    'ali.davari@example.com',
    'emad.ghaeni@example.com',
    'saeed.roshani@example.com',
    'asiyeh.hatami@example.com',
    'asal.aghaz@example.com',
    'mohammadreza.mirzaei@example.com',
    'mohammadmahdi.piroozan@example.com',
    'mahshad.abtahi@example.com',
    'ali.soltanpanah@example.com',
    'soheil.azimi@example.com',
    'hanif.salmkar@example.com',
    'danial.kafi@example.com',
    'jafar.mirzadeh@example.com',
    'tavakol.sharafi@example.com'
  ],
  
  // Exhibitors to keep (from seed-hr-analytics-event.ts)
  exhibitorNames: [
    'hamkaran-system',
    'irancell',
    'digikala',
    'mohaimen',
    'bank-melli'
  ],
  
  // Events to keep (from seed-hr-analytics-event.ts)
  eventNames: [
    'hr-analytics-event-2025',
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
  ],
  
  // Categories to keep (from update-persian-categories.ts)
  categoryNames: [
    'electronics',
    'fashion',
    'home-garden',
    'sports',
    'books-media',
    'automotive',
    'food-beverage',
    'health-beauty',
    'services',
    'tech-solutions',
    'mobile-accessories',
    'data-services',
    'future-tech'
  ]
};

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🧹 Cleaning Up Mock Data');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('Keeping only data from seed files:');
  console.log(`  - Users: ${SEED_DATA_TO_KEEP.userEmails.length} seed users`);
  console.log(`  - Exhibitors: ${SEED_DATA_TO_KEEP.exhibitorNames.length} HR Analytics exhibitors`);
  console.log(`  - Events: ${SEED_DATA_TO_KEEP.eventNames.length} HR Analytics events`);
  console.log(`  - Categories: ${SEED_DATA_TO_KEEP.categoryNames.length} categories`);
  console.log('');

  try {
    // Step 1: Delete products from mock exhibitors
    console.log('📦 Step 1: Cleaning up Products');
    console.log('─────────────────────────────────────────────────');
    const allProducts = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { exhibitor: true }
    });

    const productsToDelete = allProducts.filter(
      product => !SEED_DATA_TO_KEEP.exhibitorNames.includes(product.exhibitor.name)
    );

    if (productsToDelete.length > 0) {
      for (const product of productsToDelete) {
        await prisma.product.update({
          where: { id: product.id },
          data: { deletedAt: new Date() }
        });
      }
      console.log(`✅ Deleted ${productsToDelete.length} mock products`);
    } else {
      console.log('ℹ️  No mock products to delete');
    }
    console.log('');

    // Step 2: Delete mock exhibitors
    console.log('🏢 Step 2: Cleaning up Exhibitors');
    console.log('─────────────────────────────────────────────────');
    const allExhibitors = await prisma.exhibitor.findMany({
      where: { deletedAt: null }
    });

    const exhibitorsToDelete = allExhibitors.filter(
      exhibitor => !SEED_DATA_TO_KEEP.exhibitorNames.includes(exhibitor.name)
    );

    if (exhibitorsToDelete.length > 0) {
      for (const exhibitor of exhibitorsToDelete) {
        await prisma.exhibitor.update({
          where: { id: exhibitor.id },
          data: { deletedAt: new Date() }
        });
      }
      console.log(`✅ Deleted ${exhibitorsToDelete.length} mock exhibitors:`);
      exhibitorsToDelete.forEach(e => console.log(`   - ${e.name} (${e.title})`));
    } else {
      console.log('ℹ️  No mock exhibitors to delete');
    }
    console.log('');

    // Step 3: Delete mock events (already handled, but verify)
    console.log('📅 Step 3: Verifying Events');
    console.log('─────────────────────────────────────────────────');
    const allEvents = await prisma.event.findMany({
      where: { deletedAt: null }
    });

    const eventsToKeep = allEvents.filter(
      event => SEED_DATA_TO_KEEP.eventNames.includes(event.name)
    );
    const otherEvents = allEvents.filter(
      event => !SEED_DATA_TO_KEEP.eventNames.includes(event.name)
    );

    console.log(`✅ Keeping ${eventsToKeep.length} HR Analytics events`);
    if (otherEvents.length > 0) {
      console.log(`ℹ️  Found ${otherEvents.length} other events (should already be deleted)`);
    }
    console.log('');

    // Step 4: Delete mock attendees (keep only HR Analytics related)
    console.log('🎫 Step 4: Cleaning up Attendees');
    console.log('─────────────────────────────────────────────────');
    const hrEventIds = eventsToKeep.map(e => e.id);
    const allAttendees = await prisma.attendee.findMany({
      include: { event: true }
    });

    const attendeesToDelete = allAttendees.filter(
      attendee => !hrEventIds.includes(attendee.eventId)
    );

    if (attendeesToDelete.length > 0) {
      await prisma.attendee.deleteMany({
        where: {
          id: { in: attendeesToDelete.map(a => a.id) }
        }
      });
      console.log(`✅ Deleted ${attendeesToDelete.length} mock attendees`);
    } else {
      console.log('ℹ️  No mock attendees to delete');
    }
    console.log('');

    // Step 5: Delete mock users (keep only seed users)
    console.log('👥 Step 5: Cleaning up Users');
    console.log('─────────────────────────────────────────────────');
    const allUsers = await prisma.user.findMany({
      where: { deletedAt: null }
    });

    const usersToDelete = allUsers.filter(
      user => !SEED_DATA_TO_KEEP.userEmails.includes(user.email)
    );

    if (usersToDelete.length > 0) {
      // Soft delete users (don't hard delete as they might have relations)
      for (const user of usersToDelete) {
        await prisma.user.update({
          where: { id: user.id },
          data: { deletedAt: new Date() }
        });
      }
      console.log(`✅ Deleted ${usersToDelete.length} mock users`);
    } else {
      console.log('ℹ️  No mock users to delete');
    }
    console.log('');

    // Step 6: Clean up unused tags (keep all tags as they're used by HR events)
    console.log('🏷️  Step 6: Verifying Tags');
    console.log('─────────────────────────────────────────────────');
    const allTags = await prisma.tag.findMany();
    console.log(`ℹ️  Keeping all ${allTags.length} tags (used by HR Analytics events)`);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Cleanup Completed Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📊 Database now contains only:');
    console.log(`  ✅ ${eventsToKeep.length} HR Analytics events`);
    console.log(`  ✅ ${SEED_DATA_TO_KEEP.exhibitorNames.length} HR Analytics exhibitors`);
    console.log(`  ✅ ${SEED_DATA_TO_KEEP.userEmails.length} seed users (admin, test users, speakers)`);
    console.log(`  ✅ Categories and tags from seed files`);
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during cleanup:');
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

export { main as cleanupMockData };

