import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Normalize Iranian phone number to format: 09xxxxxxxxx
 */
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('98')) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.startsWith('9') && !cleaned.startsWith('09')) {
    cleaned = '0' + cleaned;
  }
  
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
}

async function main() {
  const phoneNumber = process.argv[2];
  const eventName = process.argv[3] || 'hr-analytics-event-2025';
  const registerAllPaymentFree = process.argv[2] === '--all';

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📝 Registering User(s) for Event');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Find the event
  const event = await prisma.event.findFirst({
    where: {
      name: eventName,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      title: true,
    },
  });

  if (!event) {
    console.error(`❌ Event not found: ${eventName}`);
    console.error('');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`📅 Event: ${event.title} (${event.name})`);
  console.log(`   ID: ${event.id}`);
  console.log('');

  let usersToRegister: Array<{ id: string; phone: string; firstname: string; lastname: string; email: string; company: string | null; jobTitle: string | null; isPaymentFree: boolean }> = [];

  if (registerAllPaymentFree) {
    // Get all payment-free users
    console.log('🔍 Finding all payment-free users...');
    const paymentFreeUsers = await prisma.user.findMany({
      where: {
        isPaymentFree: true,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        phone: true,
        firstname: true,
        lastname: true,
        email: true,
        company: true,
        jobTitle: true,
        isPaymentFree: true,
      },
    });

    // Also check owner phone
    const ownerPhone = process.env.OWNER_PHONE;
    if (ownerPhone) {
      const owner = await prisma.user.findFirst({
        where: {
          phone: ownerPhone,
          isActive: true,
          deletedAt: null,
        },
        select: {
          id: true,
          phone: true,
          firstname: true,
          lastname: true,
          email: true,
          company: true,
          jobTitle: true,
          isPaymentFree: true,
        },
      });
      if (owner && !paymentFreeUsers.find(u => u.id === owner.id)) {
        paymentFreeUsers.push(owner);
      }
    }

    usersToRegister = paymentFreeUsers;
    console.log(`📋 Found ${usersToRegister.length} payment-free users to register`);
    console.log('');
  } else if (phoneNumber) {
    // Register specific user by phone
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const user = await prisma.user.findFirst({
      where: {
        phone: normalizedPhone,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        phone: true,
        firstname: true,
        lastname: true,
        email: true,
        company: true,
        jobTitle: true,
        isPaymentFree: true,
      },
    });

    if (!user) {
      console.error(`❌ User not found with phone number: ${normalizedPhone}`);
      console.error('');
      await prisma.$disconnect();
      process.exit(1);
    }

    usersToRegister = [user];
    console.log(`📱 Registering user: ${user.firstname} ${user.lastname} (${user.phone})`);
    console.log('');
  } else {
    console.error('❌ Please provide a phone number or use --all flag');
    console.error('');
    console.error('Usage:');
    console.error('  Register specific user: npm run register:for-event <phone-number>');
    console.error('  Register all payment-free: npm run register:for-event --all');
    console.error('');
    await prisma.$disconnect();
    process.exit(1);
  }

  const results = {
    registered: [] as Array<{ phone: string; name: string; attendeeId: string }>,
    alreadyRegistered: [] as Array<{ phone: string; name: string }>,
    errors: [] as Array<{ phone: string; error: string }>,
  };

  // Register each user
  for (const user of usersToRegister) {
    try {
      // Check if already registered
      const existingAttendee = await prisma.attendee.findFirst({
        where: {
          eventId: event.id,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (existingAttendee) {
        results.alreadyRegistered.push({
          phone: user.phone,
          name: `${user.firstname} ${user.lastname}`,
        });
        console.log(`ℹ️  ${user.phone} - ${user.firstname} ${user.lastname} (already registered)`);
        continue;
      }

      // Create attendee record
      const attendee = await prisma.attendee.create({
        data: {
          event: { connect: { id: event.id } },
          user: { connect: { id: user.id } },
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          company: user.company,
          jobTitle: user.jobTitle,
          phone: user.phone,
        },
        select: {
          id: true,
        },
      });

      // If user is payment-free, create completed payment
      const ownerPhone = process.env.OWNER_PHONE;
      const isOwner = ownerPhone && user.phone === ownerPhone;
      const isPaymentFree = isOwner || user.isPaymentFree === true;

      if (isPaymentFree) {
        await prisma.payment.create({
          data: {
            userId: user.id,
            eventId: event.id,
            attendeeId: attendee.id,
            amount: 0,
            currency: 'IRR',
            status: 'COMPLETED',
            gateway: 'payment-free-bypass',
            refId: 'PAYMENT-FREE-' + Date.now(),
            paidAt: new Date(),
            metadata: { paymentFreeBypass: true },
          },
        });
      }

      results.registered.push({
        phone: user.phone,
        name: `${user.firstname} ${user.lastname}`,
        attendeeId: attendee.id,
      });

      console.log(`✅ ${user.phone} - ${user.firstname} ${user.lastname} (registered)`);
    } catch (error: any) {
      results.errors.push({ phone: user.phone, error: error.message });
      console.log(`❌ ${user.phone} - Error: ${error.message}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Newly registered: ${results.registered.length}`);
  console.log(`ℹ️  Already registered: ${results.alreadyRegistered.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log('');

  if (results.registered.length > 0) {
    console.log('✅ Newly registered users:');
    results.registered.forEach(({ phone, name }) => {
      console.log(`   - ${phone} | ${name}`);
    });
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('❌ Errors:');
    results.errors.forEach(({ phone, error }) => {
      console.log(`   - ${phone}: ${error}`);
    });
    console.log('');
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as registerUserForEvent };

