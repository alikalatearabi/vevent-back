import { PrismaClient } from '@prisma/client';
import { setPaymentFree } from './set-payment-free';

const prisma = new PrismaClient();

/**
 * Normalize Iranian phone number to format: 09xxxxxxxxx
 * Handles: 912..., 0912..., 98912..., etc.
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all spaces and non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Remove country code 98 if present
  if (cleaned.startsWith('98')) {
    cleaned = cleaned.substring(2);
  }
  
  // If starts with 9 (without 0), add 0
  if (cleaned.startsWith('9') && !cleaned.startsWith('09')) {
    cleaned = '0' + cleaned;
  }
  
  // Ensure it starts with 0
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
}

async function main() {
  // List of speaker phone numbers
  const speakerPhones = [
    '9123228016',
    '9123008549',
    '9128920816',
    '9129212431',
    '9127121650',
    '9123950311',
    '9121073550',
    '9123084508',
    '9123931786',
    '9121383890',
    '9353238691',
    '9912037896',
    '9125153007',
    '9184361920',
    '9122881684',
    '989125373861',
    '9362391731',
    '09125472260',
    '09196632579',
    '9352000141',
    '9352001509',
    '9129275507',
    '09124445653', // مسعود کرمی
    '09191574158', // پرستو فیضی
    '09194988653',
    '09121201717',
  ];

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔓 Setting Multiple Speakers as Payment-Free');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Normalize and deduplicate phone numbers
  const normalizedPhones = speakerPhones
    .map(normalizePhoneNumber)
    .filter((phone, index, self) => self.indexOf(phone) === index); // Remove duplicates

  console.log(`📋 Processing ${normalizedPhones.length} unique phone numbers...`);
  console.log('');

  const results = {
    success: [] as string[],
    notFound: [] as string[],
    alreadySet: [] as string[],
    errors: [] as { phone: string; error: string }[],
  };

  // Process each phone number
  for (const phone of normalizedPhones) {
    try {
      const user = await prisma.user.findFirst({
        where: { phone },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          isPaymentFree: true,
        },
      });

      if (!user) {
        results.notFound.push(phone);
        console.log(`⚠️  ${phone} - User not found (user needs to register first)`);
        continue;
      }

      if (user.isPaymentFree) {
        results.alreadySet.push(phone);
        console.log(`ℹ️  ${phone} - ${user.firstname} ${user.lastname} (already payment-free)`);
        continue;
      }

      // Update user to payment-free
      await prisma.user.update({
        where: { id: user.id },
        data: { isPaymentFree: true },
      });

      results.success.push(phone);
      console.log(`✅ ${phone} - ${user.firstname} ${user.lastname} (set as payment-free)`);
    } catch (error: any) {
      results.errors.push({ phone, error: error.message });
      console.log(`❌ ${phone} - Error: ${error.message}`);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`✅ Successfully set: ${results.success.length}`);
  console.log(`ℹ️  Already payment-free: ${results.alreadySet.length}`);
  console.log(`⚠️  Not found (need to register): ${results.notFound.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log('');

  if (results.success.length > 0) {
    console.log('✅ Successfully set as payment-free:');
    results.success.forEach(phone => console.log(`   - ${phone}`));
    console.log('');
  }

  if (results.alreadySet.length > 0) {
    console.log('ℹ️  Already payment-free:');
    results.alreadySet.forEach(phone => console.log(`   - ${phone}`));
    console.log('');
  }

  if (results.notFound.length > 0) {
    console.log('⚠️  Users not found (they need to register first):');
    results.notFound.forEach(phone => console.log(`   - ${phone}`));
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

export { main as setPaymentFreeBatch };

