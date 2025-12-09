import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizePhone(phone: string): string {
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

// Hardcoded speaker phones from the service
const speakerPhones = new Set([
  '09123228016',
  '09123008549',
  '09128920816',
  '09129212431',
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
  '09196632579',
  '09352000141',
  '09352001509',
  '09129275507',
  '09901241411',
  '09366578941',
  '09021593124',
  '09124445653',
  '09191574158',
  '09194988653',
  '09121201717',
  '09024634361',
  '09155203073',
]);

async function checkPaymentBypass(phone: string) {
  const normalized = normalizePhone(phone);
  
  console.log(`Checking phone number: ${phone}`);
  console.log(`Normalized: ${normalized}`);
  console.log('');

  // Check if in speaker phones list
  const isSpeaker = speakerPhones.has(normalized);
  console.log(`✓ In speaker phones list: ${isSpeaker ? 'YES' : 'NO'}`);

  // Check owner phone
  const ownerPhone = process.env.OWNER_PHONE;
  const isOwner = ownerPhone && normalized === normalizePhone(ownerPhone);
  console.log(`✓ Is owner phone: ${isOwner ? 'YES' : 'NO'}`);

  // Check database
  const user = await prisma.user.findFirst({
    where: { phone: normalized },
    select: {
      id: true,
      phone: true,
      firstname: true,
      lastname: true,
      isPaymentFree: true,
    },
  });

  if (user) {
    console.log(`✓ User found in database: ${user.firstname} ${user.lastname}`);
    console.log(`✓ Database isPaymentFree flag: ${user.isPaymentFree ? 'YES' : 'NO'}`);
  } else {
    console.log(`✗ User NOT found in database`);
  }

  // Final result
  const canBypass = isOwner || isSpeaker || (user?.isPaymentFree === true);
  console.log('');
  console.log('='.repeat(50));
  console.log(`RESULT: ${canBypass ? '✅ CAN BYPASS PAYMENT' : '❌ CANNOT BYPASS PAYMENT'}`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

const phoneNumber = process.argv[2] || '9129212431';
checkPaymentBypass(phoneNumber)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

