import { PrismaClient, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a random 7-character alphanumeric code (uppercase)
 */
function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a single unlimited 35% discount code
 */
async function createUnlimitedCode() {
  console.log('Creating unlimited 35% discount code...\n');

  // Generate a unique code
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    code = generateCode();
    const existing = await prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique code after 100 attempts');
  }

  try {
    const discountCode = await prisma.discountCode.create({
      data: {
        code: code!.toUpperCase(),
        discountType: DiscountType.PERCENTAGE,
        discountValue: 35,
        expiresAt: null, // No expiration
        maxUses: null, // Unlimited uses
        isActive: true,
        currentUses: 0,
        singleUsePerUser: false,
      },
    });

    console.log('✅ Discount code created successfully!');
    console.log('==================================================');
    console.log(`Code: ${discountCode.code}`);
    console.log(`Discount: 35%`);
    console.log(`Expiration: Never (unlimited time)`);
    console.log(`Max Uses: Unlimited`);
    console.log(`Status: Active`);
    console.log('==================================================\n');

    return discountCode;
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error(`❌ Code ${code} already exists. Please try again.`);
    } else {
      console.error('❌ Error creating discount code:', error);
    }
    throw error;
  }
}

createUnlimitedCode()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n✗ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

