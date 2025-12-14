import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded speaker phones from the service (normalized to 09xxxxxxxxx format)
const speakerPhones = [
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
  '09901241411', // مهرشاد حسنی
  '09366578941', // فرزین همایونفر
  '09021593124', // بتیا بیدآباد
  '09124445653', // مسعود کرمی
  '09191574158', // پرستو فیضی
  '09194988653',
  '09121201717',
  '09024634361',
  '09155203073',
];

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 All Phone Numbers That Can Bypass Payment');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // 1. Get owner phone from environment
  const ownerPhone = process.env.OWNER_PHONE;
  
  // 2. Get users from database with isPaymentFree flag
  const dbPaymentFreeUsers = await prisma.user.findMany({
    where: {
      isPaymentFree: true,
      deletedAt: null,
    },
    select: {
      phone: true,
      firstname: true,
      lastname: true,
      email: true,
    },
    orderBy: {
      phone: 'asc',
    },
  });

  // Combine all phone numbers and remove duplicates
  const allPhones = new Set<string>();
  
  // Add owner phone
  if (ownerPhone) {
    allPhones.add(ownerPhone);
  }
  
  // Add speaker phones
  speakerPhones.forEach(phone => allPhones.add(phone));
  
  // Add database payment-free users
  dbPaymentFreeUsers.forEach(user => allPhones.add(user.phone));

  // Convert to sorted array
  const sortedPhones = Array.from(allPhones).sort();

  console.log(`📊 Summary:`);
  console.log(`   - Owner Phone: ${ownerPhone ? '✅ Set' : '❌ Not set'}`);
  console.log(`   - Hardcoded Speaker Phones: ${speakerPhones.length}`);
  console.log(`   - Database Payment-Free Users: ${dbPaymentFreeUsers.length}`);
  console.log(`   - Total Unique Phone Numbers: ${sortedPhones.length}`);
  console.log('');

  console.log('═══════════════════════════════════════════════════');
  console.log('📱 Complete List of Phone Numbers:');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  sortedPhones.forEach((phone, index) => {
    const isOwner = ownerPhone && phone === ownerPhone;
    const isSpeaker = speakerPhones.includes(phone);
    const dbUser = dbPaymentFreeUsers.find(u => u.phone === phone);
    
    const sources: string[] = [];
    if (isOwner) sources.push('OWNER');
    if (isSpeaker) sources.push('SPEAKER');
    if (dbUser) sources.push('DATABASE');
    
    console.log(`${(index + 1).toString().padStart(3, ' ')}. ${phone} ${sources.length > 0 ? `[${sources.join(', ')}]` : ''}`);
    if (dbUser) {
      console.log(`     👤 ${dbUser.firstname} ${dbUser.lastname} (${dbUser.email})`);
    }
  });

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📝 Breakdown by Source:');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  if (ownerPhone) {
    console.log(`1. Owner Phone (from OWNER_PHONE env variable):`);
    console.log(`   ${ownerPhone}`);
    console.log('');
  }

  console.log(`2. Hardcoded Speaker Phones (${speakerPhones.length} numbers):`);
  speakerPhones.forEach((phone, index) => {
    console.log(`   ${(index + 1).toString().padStart(3, ' ')}. ${phone}`);
  });
  console.log('');

  if (dbPaymentFreeUsers.length > 0) {
    console.log(`3. Database Payment-Free Users (${dbPaymentFreeUsers.length} users):`);
    dbPaymentFreeUsers.forEach((user, index) => {
      console.log(`   ${(index + 1).toString().padStart(3, ' ')}. ${user.phone} - ${user.firstname} ${user.lastname} (${user.email})`);
    });
  } else {
    console.log(`3. Database Payment-Free Users: None`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

