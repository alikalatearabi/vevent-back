import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phoneNumber = process.argv[2];
  
  if (!phoneNumber) {
    console.log('❌ Please provide a phone number');
    console.log('Usage: npm run remove:payment-free <phone-number>');
    process.exit(1);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔒 Removing Payment-Free Status');
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
    console.log(`   Current Payment-Free Status: ${user.isPaymentFree ? '✅ Yes' : '❌ No'}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log('');

    if (!user.isPaymentFree) {
      console.log('ℹ️  User is already not payment-free');
      console.log('');
      return;
    }

    // Remove payment-free status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isPaymentFree: false },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        isPaymentFree: true,
        updatedAt: true,
      },
    });

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ User Updated Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📋 Updated User Details:');
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Name: ${updatedUser.firstname} ${updatedUser.lastname}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Phone: ${updatedUser.phone}`);
    console.log(`   Payment-Free Status: ${updatedUser.isPaymentFree ? '✅ Yes' : '❌ No'}`);
    console.log(`   Updated At: ${updatedUser.updatedAt}`);
    console.log('');
    console.log('🔒 This user will now need to complete payment to access the dashboard.');
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

