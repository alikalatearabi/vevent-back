import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding payments with amount 0 and status PENDING...\n');

  // Find all payments with status PENDING that have discount code usage
  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: 'PENDING',
    },
    select: {
      id: true,
      userId: true,
      eventId: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      discountCodeUsage: {
        select: {
          finalAmount: true,
          discountCode: {
            select: {
              code: true,
              discountValue: true,
              discountType: true,
            },
          },
        },
      },
    },
  });

  // Filter to those with amount 0 OR finalAmount from discount code usage is 0
  const zeroAmountPayments = pendingPayments.filter(
    (p) => p.amount.toNumber() === 0 || (p.discountCodeUsage?.finalAmount.toNumber() === 0)
  );

  console.log(`Found ${zeroAmountPayments.length} payments with amount 0 and status PENDING\n`);

  if (zeroAmountPayments.length === 0) {
    console.log('✅ No payments to fix. Exiting...');
    return;
  }

  console.log('📋 Payments to fix:');
  zeroAmountPayments.forEach((payment, index) => {
    const discountCode = payment.discountCodeUsage?.discountCode;
    const finalAmount = payment.discountCodeUsage?.finalAmount.toNumber() ?? payment.amount.toNumber();
    console.log(
      `\n${index + 1}. Payment ID: ${payment.id}`,
      `\n   User ID: ${payment.userId}`,
      `\n   Event ID: ${payment.eventId}`,
      `\n   Current Amount: ${payment.amount.toNumber()} ${payment.currency || 'IRR'}`,
      `\n   Final Amount (after discount): ${finalAmount} ${payment.currency || 'IRR'}`,
      `\n   Status: ${payment.status}`,
      `\n   Created: ${payment.createdAt.toISOString()}`,
      discountCode
        ? `\n   Discount Code: ${discountCode.code} (${discountCode.discountType} ${discountCode.discountValue})`
        : '',
    );
  });

  console.log('\n🔄 Updating payments to COMPLETED status...\n');

  let updatedCount = 0;
  for (const payment of zeroAmountPayments) {
    try {
      const finalAmount = payment.discountCodeUsage?.finalAmount.toNumber() ?? payment.amount.toNumber();
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          amount: finalAmount, // Update amount to final amount after discount
          status: 'COMPLETED',
          paidAt: payment.createdAt, // Use creation date as paid date
          gateway: 'free-payment',
          refId: `FREE-${Date.now()}-${payment.id.substring(0, 8)}`,
          metadata: {
            autoCompleted: true,
            fixedAt: new Date().toISOString(),
            originalAmount: payment.amount.toNumber(), // Store original amount in metadata
            ...(payment.discountCodeUsage?.discountCode && {
              discountCode: payment.discountCodeUsage.discountCode.code,
            }),
          },
        },
      });
      updatedCount++;
      console.log(`✅ Updated payment ${payment.id} (amount: ${payment.amount.toNumber()} → ${finalAmount}, status: PENDING → COMPLETED)`);
    } catch (error) {
      console.error(`❌ Failed to update payment ${payment.id}:`, error.message);
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} out of ${zeroAmountPayments.length} payments`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

