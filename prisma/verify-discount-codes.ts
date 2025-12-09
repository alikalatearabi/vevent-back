import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCodes() {
  // Sample codes from each category
  const codesToCheck = {
    '70%': ['4VWWCUU', '4GJBXRZ', 'F5X8BJ2', 'PDURS54', '3EM7CSK'],
    '60%': ['L3QPFS7', 'TXRCASE', '8W5JL49', 'B2BSB5P', 'HRUBQFK'],
    '50%': ['U9ERRSX', '42YCKEL', 'KSL5SAC', 'HALY9UD', '3Y6SZJ9'],
    '100%': ['WES257A', 'RLQKYJW', 'PR76QYX', 'CHZKL92', 'VRQDRUJ'],
  };

  console.log('Checking discount codes in database...\n');

  for (const [percentage, codes] of Object.entries(codesToCheck)) {
    console.log(`\n${percentage} Discount Codes:`);
    console.log('-'.repeat(50));

    for (const code of codes) {
      const found = await prisma.discountCode.findUnique({
        where: { code },
        select: {
          code: true,
          discountValue: true,
          discountType: true,
          isActive: true,
          currentUses: true,
          maxUses: true,
          expiresAt: true,
        },
      });

      if (found) {
        console.log(
          `✓ ${code} - ${found.discountValue}% - Active: ${found.isActive} - Uses: ${found.currentUses}/${found.maxUses || 'unlimited'}`,
        );
      } else {
        console.log(`✗ ${code} - NOT FOUND IN DATABASE`);
      }
    }
  }

  // Also get counts by discount value
  console.log('\n\nSummary by Discount Percentage:');
  console.log('='.repeat(50));

  const allCodes = await prisma.discountCode.findMany({
    select: {
      discountValue: true,
      isActive: true,
    },
  });

  const counts: Record<string, { total: number; active: number }> = {};

  for (const code of allCodes) {
    const value = code.discountValue.toString();
    if (!counts[value]) {
      counts[value] = { total: 0, active: 0 };
    }
    counts[value].total++;
    if (code.isActive) {
      counts[value].active++;
    }
  }

  for (const [value, count] of Object.entries(counts).sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))) {
    console.log(`${value}%: ${count.total} total (${count.active} active)`);
  }

  await prisma.$disconnect();
}

verifyCodes()
  .then(() => {
    console.log('\n✓ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });

