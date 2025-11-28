import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🗑️  Deleting All Payment Records');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Count payments before deletion
    const paymentCount = await prisma.payment.count();
    console.log(`📊 Found ${paymentCount} payment record(s) in the database`);
    console.log('');

    if (paymentCount === 0) {
      console.log('ℹ️  No payments to delete');
      console.log('');
      return;
    }

    // Show payment status breakdown
    const statusBreakdown = await prisma.payment.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('📋 Payment Status Breakdown:');
    statusBreakdown.forEach(({ status, _count }) => {
      console.log(`   - ${status}: ${_count}`);
    });
    console.log('');

    // Delete all payments
    console.log('🗑️  Deleting all payment records...');
    const result = await prisma.payment.deleteMany({});
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Successfully Deleted All Payments!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`📊 Deleted ${result.count} payment record(s)`);
    console.log('');

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

export { main as deleteAllPayments };

