import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phoneNumber = process.argv[2] || '09123046863';
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 Checking Payments for Phone Number');
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
    console.log(`   Created: ${user.createdAt}`);
    console.log('');

    // Get all payments for this user
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('═══════════════════════════════════════════════════');
    console.log(`💳 Payment Records: ${payments.length}`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    if (payments.length === 0) {
      console.log('ℹ️  No payment records found for this user');
      console.log('');
      return;
    }

    // Group by status
    const statusCounts = payments.reduce((acc, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Payment Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    console.log('');

    // Display each payment
    payments.forEach((payment, index) => {
      console.log(`─────────────────────────────────────────────────`);
      console.log(`Payment #${index + 1}`);
      console.log(`─────────────────────────────────────────────────`);
      console.log(`ID: ${payment.id}`);
      console.log(`Status: ${payment.status}`);
      console.log(`Amount: ${payment.amount.toNumber()} ${payment.currency}`);
      console.log(`Gateway: ${payment.gateway || 'N/A'}`);
      console.log(`Authority: ${payment.authority || 'N/A'}`);
      console.log(`RefId: ${payment.refId || 'N/A'}`);
      console.log(`Paid At: ${payment.paidAt ? payment.paidAt.toISOString() : 'N/A'}`);
      console.log(`Created: ${payment.createdAt.toISOString()}`);
      console.log(`Updated: ${payment.updatedAt.toISOString()}`);
      console.log(`Event: ${payment.event.title} (${payment.event.name})`);
      if (payment.metadata) {
        console.log(`Metadata: ${JSON.stringify(payment.metadata, null, 2)}`);
      }
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Check Complete');
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

export { main as checkPaymentByPhone };

