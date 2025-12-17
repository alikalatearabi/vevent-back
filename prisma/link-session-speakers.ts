import { AttendeeRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SpeakerMapping = {
  topic: string;
  phone: string;
  name: string;
};

// Mapping from جدول "موضوع / شماره / نام" به سخنران‌ها
// (شماره‌ها به صورت آزاد نوشته شده‌اند؛ در اسکریپت نرمال‌سازی می‌شوند)
const mappings: SpeakerMapping[] = [
  { topic: 'هوش مصنوعی انسان‌محور: مقیاس‌پذیری توسعه سرمایه انسانی', phone: '9123228016', name: 'مجید نیلی احمدآبادی' },
  { topic: 'داستان سرایی داده‌محور برای مدیران: از تحلیل تا تصمیم', phone: '9123008549', name: 'عسل آغاز' },
  { topic: 'انقلاب زبان در سازمان‌ها: از پردازش زبان طبیعی (NLP) تا مزیت رقابتی', phone: '9128920816', name: 'سعید روشنی' },
  { topic: 'کاربردهای مدل‌های زبانی بزرگ (LLMs) و آنالیز سری‌های زمانی در تحلیل‌گری منابع انسانی', phone: '9129212431', name: 'محمدرضا میرزایی' },
  { topic: 'گام‌به‌گام تا پیاده‌سازی HR Analytics در تیم‌های مجازی', phone: '9127121650', name: 'محمدحسن بهمن‌پور' },
  { topic: 'از شهود تا شواهد: پیش‌نیازهای سازمانی برای استقرار موفق تحلیلگری منابع انسانی از منظر مدیران عامل', phone: '9123950311', name: 'سید باباک علوی' },
  { topic: 'از شهود تا شواهد: پیش‌نیازهای سازمانی برای استقرار موفق تحلیلگری منابع انسانی از منظر مدیران عامل', phone: '9121073550', name: 'شهاب جوانمردی' },
  { topic: 'از شهود تا شواهد: پیش‌نیازهای سازمانی برای استقرار موفق تحلیلگری منابع انسانی از منظر مدیران عامل', phone: '9123084508', name: 'فرزاد رحمانی' },
  { topic: 'از شهود تا شواهد: پیش‌نیازهای سازمانی برای استقرار موفق تحلیلگری منابع انسانی از منظر مدیران عامل', phone: '9123931786', name: 'محمد مظاهری' },
  { topic: 'از شهود تا شواهد: پیش‌نیازهای سازمانی برای استقرار موفق تحلیلگری منابع انسانی از منظر مدیران عامل', phone: '9121383890', name: 'محمد عزیزاللهی' },
  { topic: 'تحلیلگری منابع انسانی در عمل: چالش‌ها و فرصت‌های پیاده‌سازی HR Analytics از دیدگاه مدیران ارشد منابع انسانی', phone: '9353238691', name: 'عطیه سادات میرفخار' },
  { topic: 'تحلیلگری منابع انسانی در عمل: چالش‌ها و فرصت‌های پیاده‌سازی HR Analytics از دیدگاه مدیران ارشد منابع انسانی', phone: '9912037896', name: 'شهرزاد فتاحی راد' },
  { topic: 'تحلیلگری منابع انسانی در عمل: چالش‌ها و فرصت‌های پیاده‌سازی HR Analytics از دیدگاه مدیران ارشد منابع انسانی', phone: '9125153007', name: 'اشکان بنکدار' },
  { topic: 'تحلیلگری منابع انسانی در عمل: چالش‌ها و فرصت‌های پیاده‌سازی HR Analytics از دیدگاه مدیران ارشد منابع انسانی', phone: '9184361920', name: 'حسن موذنی' },
  { topic: 'تحلیلگری منابع انسانی در عمل: چالش‌ها و فرصت‌های پیاده‌سازی HR Analytics از دیدگاه مدیران ارشد منابع انسانی', phone: '9122881684', name: 'احمد حسنی کاخکی' },
  { topic: 'از داده به بینش، تحول منابع‌انسانی با تحلیل یکپارچه', phone: '9912037896', name: 'شهرزاد فتاحی راد' },
  { topic: 'از داده به بینش، تحول منابع‌انسانی با تحلیل یکپارچه', phone: '+989125373861', name: 'الهام یگانه راد' },
  { topic: 'حکمرانی و سیاست گذاری داده محور نظام جبران خدمات', phone: '9125153007', name: 'اشکان بنکدارپور' },
  { topic: 'حکمرانی و سیاست گذاری داده محور نظام جبران خدمات', phone: '09191574158', name: 'پرستو فیضی' },
  { topic: 'حکمرانی و سیاست گذاری داده محور نظام جبران خدمات', phone: '9362391731', name: 'مهسا جوان' },
  { topic: 'هوش مصنوعی و مسیرهای نوآورانه آنبوردینگ مدیران', phone: '9122881684', name: 'احمد حسنی کاخکی' },
  { topic: 'هوش مصنوعی و مسیرهای نوآورانه آنبوردینگ مدیران', phone: '09125472260', name: 'نسترن معشوری' },
  { topic: 'تحول دیجیتال در سرمایه انسانی شرکت توسن تکنو', phone: '9184361920', name: 'حسین موذنی' },
  { topic: 'تحول دیجیتال در سرمایه انسانی شرکت توسن تکنو', phone: '09124445653', name: 'مسعود کرمی' },
  { topic: 'ارزیابی از مدیران: از تحلیل داده‌محور تا اقدامات ملموس', phone: '9155203073', name: 'فاطمه یاسمنی' },
  { topic: 'ارزیابی از مدیران: از تحلیل داده‌محور تا اقدامات ملموس', phone: '09196632579', name: 'علیرضا یزدی' },
  { topic: 'رمزگشایی برند کارفرمایی: ترجمه ادراک به زبان داده', phone: '9352000141', name: 'مهشاد ابطحی' },
  { topic: 'رمزگشایی برند کارفرمایی: ترجمه ادراک به زبان داده', phone: '9352001509', name: 'رضا سهرابی' },
  { topic: 'معماری تجربه کارکنان اسنپ فود با تکیه بر داده', phone: '9129275507', name: 'صادق اشرفی' },
  { topic: 'همگام با تغییر ذهنیت در عصر AI', phone: '9121201717', name: 'بهاره گوهرین' },
];

// Normalize phone numbers to 09xxxxxxxxx format (same logic used elsewhere)
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
  const dryRunEnv = process.env.DRY_RUN;
  const dryRun = dryRunEnv === undefined || dryRunEnv === '' || dryRunEnv === 'true';

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🔗 Linking session speakers to events');
  console.log('═══════════════════════════════════════════════════');
  console.log(`DRY_RUN = ${dryRun}`);
  console.log('');

  const orderByTopic: Record<string, number> = {};

  for (const mapping of mappings) {
    const normalizedPhone = normalizePhone(mapping.phone);
    const topic = mapping.topic.trim();

    // 1) Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone: normalizedPhone, deletedAt: null },
    });

    if (!user) {
      console.warn(
        `❌ User not found for phone ${mapping.phone} (normalized: ${normalizedPhone}) – ${mapping.name}`,
      );
      continue;
    }

    // 2) Find event by title (exact match first, then fallback to contains)
    let event = await prisma.event.findFirst({
      where: {
        deletedAt: null,
        title: topic,
      },
    });

    if (!event) {
      event = await prisma.event.findFirst({
        where: {
          deletedAt: null,
          title: {
            contains: topic,
          },
        },
      });
    }

    if (!event) {
      console.warn(`❌ Event not found for topic "${topic}"`);
      continue;
    }

    // 3) Determine order within this topic (for panels with multiple speakers)
    const currentOrder = orderByTopic[topic] ?? 0;
    orderByTopic[topic] = currentOrder + 1;

    console.log(
      `✅ Match: [${topic}] -> Event(${event.id}, title="${event.title}") & User(${user.id}, ${user.firstname} ${user.lastname}, ${normalizedPhone}) order=${currentOrder}`,
    );

    if (dryRun) {
      continue;
    }

    // 4) Upsert EventSpeaker link
    await prisma.eventSpeaker.upsert({
      where: {
        eventId_userId: {
          eventId: event.id,
          userId: user.id,
        },
      },
      update: {
        role: 'SPEAKER',
        order: currentOrder,
      },
      create: {
        eventId: event.id,
        userId: user.id,
        role: 'SPEAKER',
        order: currentOrder,
      },
    });

    // 5) Ensure Attendee with role SPEAKER exists
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        eventId: event.id,
        userId: user.id,
      },
    });

    if (!existingAttendee) {
      await prisma.attendee.create({
        data: {
          eventId: event.id,
          userId: user.id,
          firstName: user.firstname,
          lastName: user.lastname,
          email: user.email,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          role: AttendeeRole.SPEAKER,
        },
      });
      console.log(
        `   ➕ Created attendee row with role SPEAKER for user ${user.id} on event ${event.id}`,
      );
    } else if (existingAttendee.role !== AttendeeRole.SPEAKER) {
      await prisma.attendee.update({
        where: { id: existingAttendee.id },
        data: { role: AttendeeRole.SPEAKER },
      });
      console.log(
        `   🔄 Updated attendee role to SPEAKER for attendee ${existingAttendee.id}`,
      );
    }
  }

  console.log('');
  console.log('✅ Linking completed');
}

main()
  .catch((e) => {
    console.error('❌ Error in link-session-speakers script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


