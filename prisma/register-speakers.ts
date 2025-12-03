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
  // List of speaker phone numbers to register
  const speakerPhones = [
    '09123228016',
    '09128920816',
    '09127121650',
    '09123950311',
    '09121073550',
    '09123084508',
    '09123931786',
    '09121383890',
    '09353238691',
    '09912037896',
    '09125153007',
    '09184361920',
    '09122881684',
    '09125373861',
    '09362391731',
    '09125472260',
    '09352000141',
    '09352001509',
    '09129275507',
    '09191574158',
    '09121201717',
  ];

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('👥 Registering Speakers');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Normalize and deduplicate phone numbers
  const normalizedPhones = speakerPhones
    .map(normalizePhoneNumber)
    .filter((phone, index, self) => self.indexOf(phone) === index);

  console.log(`📋 Processing ${normalizedPhones.length} unique phone numbers...`);
  console.log('');

  const results = {
    created: [] as Array<{ phone: string; email: string; name: string }>,
    alreadyExists: [] as string[],
    errors: [] as Array<{ phone: string; error: string }>,
  };

  // Process each phone number
  for (const phone of normalizedPhones) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findFirst({
        where: { phone },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          isPaymentFree: true,
        },
      });

      if (existing) {
        // User exists - just ensure they're payment-free
        if (!existing.isPaymentFree) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { isPaymentFree: true },
          });
          console.log(`✅ ${phone} - ${existing.firstname} ${existing.lastname} (already exists, set as payment-free)`);
        } else {
          console.log(`ℹ️  ${phone} - ${existing.firstname} ${existing.lastname} (already exists and payment-free)`);
        }
        results.alreadyExists.push(phone);
        continue;
      }

      // Create new user
      const timestamp = Date.now();
      const email = `speaker_${phone}_${timestamp}@vevent.temp`;
      const tempPassword = `temp_${phone}_${timestamp}`;
      const passwordHash = await hash(tempPassword);

      const user = await prisma.user.create({
        data: {
          firstname: 'کاربر',
          lastname: 'جدید',
          email,
          passwordHash,
          phone,
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

      results.created.push({
        phone: user.phone,
        email: user.email,
        name: `${user.firstname} ${user.lastname}`,
      });

      console.log(`✅ ${phone} - ${user.firstname} ${user.lastname} (created and set as payment-free)`);
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
  console.log(`✅ Created: ${results.created.length}`);
  console.log(`ℹ️  Already exists: ${results.alreadyExists.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);
  console.log('');

  if (results.created.length > 0) {
    console.log('✅ Newly created users:');
    results.created.forEach(({ phone, email, name }) => {
      console.log(`   - ${phone} | ${name} | ${email}`);
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

export { main as registerSpeakers };

