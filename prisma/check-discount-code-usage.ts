import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDiscountCodeUsage(code: string) {
  console.log(`Checking usage for discount code: ${code}\n`);
  console.log('='.repeat(70));

  // First, find the discount code
  const discountCode = await prisma.discountCode.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      currentUses: true,
      maxUses: true,
      isActive: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  if (!discountCode) {
    console.log(`❌ Discount code "${code}" not found in database`);
    await prisma.$disconnect();
    return;
  }

  console.log('\n📋 Discount Code Information:');
  console.log('-'.repeat(70));
  console.log(`Code: ${discountCode.code}`);
  console.log(`Type: ${discountCode.discountType}`);
  console.log(`Value: ${discountCode.discountValue}${discountCode.discountType === 'PERCENTAGE' ? '%' : ' IRR'}`);
  console.log(`Status: ${discountCode.isActive ? '✅ Active' : '❌ Inactive'}`);
  console.log(`Uses: ${discountCode.currentUses}/${discountCode.maxUses || 'unlimited'}`);
  console.log(`Expires: ${discountCode.expiresAt ? discountCode.expiresAt.toLocaleString() : 'Never'}`);
  console.log(`Created: ${discountCode.createdAt.toLocaleString()}`);

  // Get all usages
  const usages = await prisma.discountCodeUsage.findMany({
    where: {
      discountCodeId: discountCode.id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          phone: true,
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          amount: true,
          paidAt: true,
          createdAt: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          name: true,
        },
      },
    },
    orderBy: {
      usedAt: 'desc',
    },
  });

  console.log(`\n\n👥 Usage History (${usages.length} usage${usages.length !== 1 ? 's' : ''}):`);
  console.log('='.repeat(70));

  if (usages.length === 0) {
    console.log('No one has used this discount code yet.');
  } else {
    usages.forEach((usage, index) => {
      console.log(`\n${index + 1}. Usage #${index + 1}`);
      console.log('-'.repeat(70));
      console.log(`👤 User:`);
      console.log(`   Name: ${usage.user.firstname} ${usage.user.lastname}`);
      console.log(`   Email: ${usage.user.email || 'N/A'}`);
      console.log(`   Phone: ${usage.user.phone}`);
      console.log(`   User ID: ${usage.user.id}`);
      console.log(`\n💰 Payment Details:`);
      console.log(`   Payment ID: ${usage.payment.id}`);
      console.log(`   Status: ${usage.payment.status}`);
      console.log(`   Original Amount: ${usage.originalAmount.toLocaleString()} IRR`);
      console.log(`   Discount Amount: ${usage.discountAmount.toLocaleString()} IRR`);
      console.log(`   Final Amount: ${usage.finalAmount.toLocaleString()} IRR`);
      console.log(`   Payment Amount: ${usage.payment.amount.toLocaleString()} IRR`);
      console.log(`   Paid At: ${usage.payment.paidAt ? usage.payment.paidAt.toLocaleString() : 'Not paid yet'}`);
      console.log(`\n🎫 Event:`);
      console.log(`   Title: ${usage.event.title || usage.event.name}`);
      console.log(`   Event ID: ${usage.event.id}`);
      console.log(`\n📅 Used At: ${usage.usedAt.toLocaleString()}`);
    });

    // Summary
    console.log('\n\n📊 Summary:');
    console.log('='.repeat(70));
    console.log(`Total Uses: ${usages.length}`);
    console.log(`Total Discount Given: ${usages.reduce((sum, u) => sum + Number(u.discountAmount), 0).toLocaleString()} IRR`);
    console.log(`Total Revenue: ${usages.reduce((sum, u) => sum + Number(u.finalAmount), 0).toLocaleString()} IRR`);
    
    const uniqueUsers = new Set(usages.map(u => u.userId));
    console.log(`Unique Users: ${uniqueUsers.size}`);
    
    const completedPayments = usages.filter(u => u.payment.status === 'COMPLETED');
    console.log(`Completed Payments: ${completedPayments.length}`);
  }

  await prisma.$disconnect();
}

const code = process.argv[2] || 'WES257A';
checkDiscountCodeUsage(code)
  .then(() => {
    console.log('\n✓ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });

