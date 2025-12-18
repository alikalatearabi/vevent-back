import { AttendeeRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phoneNumber = process.argv[2] || '09123046863';
  const eventId = process.argv[3]; // optional: add to EventSpeaker list for a specific event

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🎤 Setting User as SPEAKER');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📱 Phone Number: ${phoneNumber}`);
  if (eventId) console.log(`🗓️  Event ID: ${eventId}`);
  console.log('');

  try {
    // 1) Find user by phone number (this is the canonical phone field)
    const user = await prisma.user.findFirst({
      where: { phone: phoneNumber },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('❌ User not found with this phone number');
      console.log('');
      console.log('💡 If this phone exists only in Attendee (and not User), we can still try updating Attendee rows.');
      console.log('');
    } else {
      console.log('✅ User Found:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.firstname} ${user.lastname}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   User.role (admin/user): ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    }

    // 2) Update attendee role by userId when possible, and also by attendee.phone as a fallback.
    // Some deployments may have attendee rows with userId null but phone populated.
    const updateResult = await prisma.attendee.updateMany({
      where: user
        ? {
            OR: [
              { userId: user.id },
              { phone: phoneNumber },
            ],
          }
        : { phone: phoneNumber },
      data: { role: AttendeeRole.SPEAKER },
    });

    // 2b) If eventId is provided, ensure the user appears in /events/:id/speakers,
    // which is backed by the EventSpeaker join table (NOT Attendee.role).
    if (eventId) {
      if (!user) {
        console.log('⚠️  Cannot add to EventSpeaker because User was not found by phone.');
        console.log('   /events/:id/speakers is based on EventSpeaker.userId, which requires a User record.');
        console.log('');
      } else {
        const ev = await prisma.event.findUnique({
          where: { id: eventId },
          select: { id: true, name: true, title: true },
        });
        if (!ev) {
          console.log('⚠️  Event not found; skipping EventSpeaker update.');
          console.log('');
        } else {
          await prisma.eventSpeaker.upsert({
            where: {
              eventId_userId: {
                eventId,
                userId: user.id,
              },
            },
            update: {},
            create: {
              eventId,
              userId: user.id,
            },
          });
          console.log(`✅ Added/confirmed EventSpeaker row for event "${ev.title ?? ev.name}"`);
          console.log('');
        }
      }
    }

    // 3) Show what was updated
    const updatedAttendees = await prisma.attendee.findMany({
      where: user
        ? {
            OR: [
              { userId: user.id },
              { phone: phoneNumber },
            ],
          }
        : { phone: phoneNumber },
      select: {
        id: true,
        eventId: true,
        userId: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Update Completed');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`🧾 Rows updated: ${updateResult.count}`);
    console.log('');

    if (updatedAttendees.length === 0) {
      console.log('ℹ️  No Attendee rows found to update for this phone.');
      console.log('');
      console.log('💡 This usually means the user has not been registered as an attendee for any event yet.');
      console.log('');
      return;
    }

    console.log('📋 Updated Attendee rows (up to 50):');
    for (const a of updatedAttendees) {
      console.log(
        `   - attendeeId=${a.id} eventId=${a.eventId} userId=${a.userId ?? 'null'} phone=${a.phone ?? 'null'} role=${a.role} name=${a.firstName} ${a.lastName}`,
      );
    }
    console.log('');
    console.log('🎉 Done — this phone is now marked as SPEAKER on their attendee records.');
    if (eventId) {
      console.log('🎯 Also ensured they are in EventSpeaker for that event (so /events/:id/speakers can return them).');
    }
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error:');
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

export { main as setSpeaker };


