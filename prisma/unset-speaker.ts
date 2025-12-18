import { AttendeeRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phoneNumber = process.argv[2] || '09123046863';
  const eventId = process.argv[3]; // optional: scope to a specific event

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('👤 Removing SPEAKER role (back to attendee/visitor)');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📱 Phone Number: ${phoneNumber}`);
  if (eventId) console.log(`🗓️  Event ID: ${eventId}`);
  console.log('');

  try {
    const user = await prisma.user.findFirst({
      where: { phone: phoneNumber },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!user) {
      console.log('❌ User not found with this phone number');
      console.log('');
      return;
    }

    console.log('✅ User Found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstname} ${user.lastname}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User.role (admin/user): ${user.role}`);
    console.log('');

    // 1) Remove from EventSpeaker (this powers /events/:id/speakers)
    const eventSpeakerDelete = await prisma.eventSpeaker.deleteMany({
      where: eventId ? { eventId, userId: user.id } : { userId: user.id },
    });

    // 2) Set Attendee.role back to VISITOR (scope to event if provided)
    const attendeeUpdate = await prisma.attendee.updateMany({
      where: eventId
        ? { eventId, OR: [{ userId: user.id }, { phone: phoneNumber }] }
        : { OR: [{ userId: user.id }, { phone: phoneNumber }] },
      data: { role: AttendeeRole.VISITOR },
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Update Completed');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`🗑️  EventSpeaker rows removed: ${eventSpeakerDelete.count}`);
    console.log(`🧾 Attendee rows updated to VISITOR: ${attendeeUpdate.count}`);
    console.log('');

    console.log('🎉 Done — user is no longer a speaker.');
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

export { main as unsetSpeaker };


