import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Numbers from user's list with names
const speakerList = [
  { phone: '09123228016', name: 'مجید نیلی احمدآبادی' },
  { phone: '09123008549', name: 'عسل آغاز' },
  { phone: '09128920816', name: 'سعید روشنی' },
  { phone: '09129212431', name: 'محمدرضا میرزایی' },
  { phone: '09127121650', name: 'محمدحسن بهمن‌پور' },
  { phone: '09123950311', name: 'سید باباک علوی' },
  { phone: '09121073550', name: 'شهاب جوانمردی' },
  { phone: '09123084508', name: 'فرزاد رحمانی' },
  { phone: '09123931786', name: 'محمد مظاهری' },
  { phone: '09121383890', name: 'محمد عزیزاللهی' },
  { phone: '09353238691', name: 'عطیه سادات میرفخار' },
  { phone: '09912037896', name: 'شهرزاد فتاحی راد' },
  { phone: '09125153007', name: 'اشکان بنکدار' },
  { phone: '09184361920', name: 'حسن/حسین موذنی' },
  { phone: '09122881684', name: 'احمد حسنی کاخکی' },
  { phone: '09125373861', name: 'الهام یگانه راد' },
  { phone: '09362391731', name: 'مهسا جوان' },
  { phone: '09125472260', name: 'نسترن معشوری' },
  { phone: '09155203073', name: 'فاطمه یاسمنی' },
  { phone: '09196632579', name: 'علیرضا یزدی' },
  { phone: '09352000141', name: 'مهشاد ابطحی' },
  { phone: '09352001509', name: 'رضا سهرابی' },
  { phone: '09129275507', name: 'صادق اشرفی' },
];

function normalizePhone(phone: string): string {
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
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 Checking Speaker Phone Numbers in Database');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  const results: Array<{
    phone: string;
    name: string;
    normalized: string;
    userExists: boolean;
    isPaymentFree: boolean;
    userId?: string;
    userName?: string;
  }> = [];

  // Check each number
  for (const speaker of speakerList) {
    const normalized = normalizePhone(speaker.phone);
    
    const user = await prisma.user.findFirst({
      where: { phone: normalized },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        isPaymentFree: true,
      },
    });

    results.push({
      phone: speaker.phone,
      name: speaker.name,
      normalized,
      userExists: !!user,
      isPaymentFree: user?.isPaymentFree || false,
      userId: user?.id,
      userName: user ? `${user.firstname} ${user.lastname}` : undefined,
    });
  }

  // Display results
  console.log('📊 Results:');
  console.log('');
  
  const notFound: typeof results = [];
  const notPaymentFree: typeof results = [];
  const alreadySet: typeof results = [];

  results.forEach(result => {
    if (!result.userExists) {
      notFound.push(result);
    } else if (!result.isPaymentFree) {
      notPaymentFree.push(result);
    } else {
      alreadySet.push(result);
    }
  });

  console.log(`✅ Already Payment-Free: ${alreadySet.length}`);
  if (alreadySet.length > 0) {
    alreadySet.forEach(r => {
      console.log(`   ${r.normalized} - ${r.name} (${r.userName || 'N/A'})`);
    });
    console.log('');
  }

  console.log(`❌ User Not Found: ${notFound.length}`);
  if (notFound.length > 0) {
    notFound.forEach(r => {
      console.log(`   ${r.normalized} - ${r.name}`);
    });
    console.log('');
  }

  console.log(`⚠️  User Exists but Not Payment-Free: ${notPaymentFree.length}`);
  if (notPaymentFree.length > 0) {
    notPaymentFree.forEach(r => {
      console.log(`   ${r.normalized} - ${r.name} (${r.userName || 'N/A'})`);
    });
    console.log('');
  }

  // Set payment-free for users that exist but aren't set
  if (notPaymentFree.length > 0) {
    console.log('═══════════════════════════════════════════════════');
    console.log('🔧 Setting Payment-Free Status...');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    let updated = 0;
    for (const result of notPaymentFree) {
      if (result.userId) {
        try {
          await prisma.user.update({
            where: { id: result.userId },
            data: { isPaymentFree: true },
          });
          console.log(`✅ Set payment-free: ${result.normalized} - ${result.name}`);
          updated++;
        } catch (error) {
          console.error(`❌ Error setting payment-free for ${result.normalized}: ${error}`);
        }
      }
    }

    console.log('');
    console.log(`✅ Updated ${updated} users to payment-free status`);
    console.log('');
  }

  // Summary
  console.log('═══════════════════════════════════════════════════');
  console.log('📋 Summary:');
  console.log('═══════════════════════════════════════════════════');
  console.log(`   Total numbers checked: ${speakerList.length}`);
  console.log(`   ✅ Already payment-free: ${alreadySet.length}`);
  console.log(`   ✅ Just set to payment-free: ${notPaymentFree.length}`);
  console.log(`   ❌ User not found (needs registration): ${notFound.length}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

