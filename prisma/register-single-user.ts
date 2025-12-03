import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

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
  const phoneNumber = process.argv[2] || '09024634361';
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('👤 Registering User');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📱 Phone Number: ${normalizedPhone}`);
  console.log('');

  try {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        isPaymentFree: true,
      },
    });

    if (existing) {
      // User exists - ensure they're payment-free
      if (!existing.isPaymentFree) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { isPaymentFree: true },
        });
        console.log(`✅ ${normalizedPhone} - ${existing.firstname} ${existing.lastname} (already exists, set as payment-free)`);
      } else {
        console.log(`ℹ️  ${normalizedPhone} - ${existing.firstname} ${existing.lastname} (already exists and payment-free)`);
      }
      console.log('');
      console.log('📋 User Details:');
      console.log(`   ID: ${existing.id}`);
      console.log(`   Name: ${existing.firstname} ${existing.lastname}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Payment-Free: ✅ Yes`);
      console.log('');
      await prisma.$disconnect();
      return;
    }

    // Create new user
    const timestamp = Date.now();
    const email = `user_${normalizedPhone}_${timestamp}@vevent.temp`;
    const tempPassword = `temp_${normalizedPhone}_${timestamp}`;
    const passwordHash = await hash(tempPassword);

    const user = await prisma.user.create({
      data: {
        firstname: 'کاربر',
        lastname: 'جدید',
        email,
        passwordHash,
        phone: normalizedPhone,
        role: 'USER',
        isActive: true,
        isPaymentFree: true, // Automatically set as payment-free
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        phone: true,
        isPaymentFree: true,
      },
    });

    console.log('✅ User created successfully!');
    console.log('');
    console.log('📋 User Details:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.firstname} ${user.lastname}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phone}`);
    console.log(`   Payment-Free: ${user.isPaymentFree ? '✅ Yes' : '❌ No'}`);
    console.log('');
    console.log('🎉 User can now access the dashboard without payment!');
    console.log('');

  } catch (error: any) {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { main as registerSingleUser };

