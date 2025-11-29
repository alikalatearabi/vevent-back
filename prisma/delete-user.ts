import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('❌ Please provide a phone number');
    console.log('Usage: npm run delete:user <phone-number>');
    process.exit(1);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🗑️  Deleting User and All Related Data');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📱 Phone Number: ${phoneNumber}`);
  console.log('');

  try {
    // Find user by phone number
    const user = await prisma.user.findFirst({
      where: { phone: phoneNumber },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        isPaymentFree: true,
        createdAt: true,
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
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Payment-Free Status: ${user.isPaymentFree ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('');
    console.log('🗑️  Deleting all related data...');
    console.log('');

    // Delete related data in order (respecting foreign key constraints)
    const userId = user.id;

    // Delete refresh tokens
    const refreshTokensDeleted = await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${refreshTokensDeleted.count} refresh token(s)`);

    // Delete notifications
    const notificationsDeleted = await prisma.notification.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${notificationsDeleted.count} notification(s)`);

    // Delete favorites
    const favoritesDeleted = await prisma.favorite.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${favoritesDeleted.count} favorite(s)`);

    // Delete recents
    const recentsDeleted = await prisma.recent.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${recentsDeleted.count} recent(s)`);

    // Delete audit logs
    const auditLogsDeleted = await prisma.auditLog.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${auditLogsDeleted.count} audit log(s)`);

    // Delete payments
    const paymentsDeleted = await prisma.payment.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${paymentsDeleted.count} payment(s)`);

    // Delete attendees
    const attendeesDeleted = await prisma.attendee.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${attendeesDeleted.count} attendee(s)`);

    // Delete event speakers
    const eventSpeakersDeleted = await prisma.eventSpeaker.deleteMany({
      where: { userId },
    });
    console.log(`   ✅ Deleted ${eventSpeakersDeleted.count} event speaker(s)`);

    // Delete exhibitors (created by user)
    const exhibitorsDeleted = await prisma.exhibitor.deleteMany({
      where: { createdById: userId },
    });
    console.log(`   ✅ Deleted ${exhibitorsDeleted.count} exhibitor(s)`);

    // Note: ConnectionRequest is linked to Attendee, not User directly
    // It will be deleted when attendees are deleted (cascade)

    // Delete products (if any, through exhibitors - but we already deleted exhibitors)
    // Products are deleted via cascade when exhibitors are deleted

    // Delete events created by user
    const eventsDeleted = await prisma.event.deleteMany({
      where: { createdById: userId },
    });
    console.log(`   ✅ Deleted ${eventsDeleted.count} event(s)`);

    // Delete user (this will also handle avatarAsset relation if needed)
    await prisma.user.delete({
      where: { id: userId },
    });
    console.log(`   ✅ Deleted user`);

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ User and all related data deleted successfully!');
    console.log('═══════════════════════════════════════════════════');
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

