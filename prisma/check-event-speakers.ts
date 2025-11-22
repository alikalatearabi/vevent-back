import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const eventId = '27c84bad-c483-46a8-96f7-e066d7aee3d5';

async function main() {
  console.log(`Checking event: ${eventId}\n`);

  // Get event details
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      title: true,
      start: true,
      end: true
    }
  });

  if (!event) {
    console.log('❌ Event not found!');
    await prisma.$disconnect();
    return;
  }

  console.log('Event Details:');
  console.log(`  Name: ${event.name}`);
  console.log(`  Title: ${event.title}`);
  console.log(`  Start: ${event.start}`);
  console.log(`  End: ${event.end}`);
  console.log('');

  // Get speakers for this event
  const speakers = await prisma.eventSpeaker.findMany({
    where: { eventId: event.id },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true
        }
      }
    }
  });

  console.log(`Speakers found: ${speakers.length}`);
  if (speakers.length > 0) {
    speakers.forEach((es, i) => {
      console.log(`  ${i + 1}. ${es.user.firstname} ${es.user.lastname} (${es.user.email}) - Role: ${es.role || 'SPEAKER'}`);
    });
  } else {
    console.log('  No speakers found for this event');
  }

  console.log('');

  // Check all events and their speaker counts
  console.log('All Events and Speaker Counts:');
  const allEvents = await prisma.event.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      title: true,
      _count: {
        select: {
          speakers: true
        }
      }
    },
    orderBy: { start: 'asc' }
  });

  allEvents.forEach(e => {
    console.log(`  ${e.name}: ${e._count.speakers} speakers`);
  });

  await prisma.$disconnect();
}

main();

