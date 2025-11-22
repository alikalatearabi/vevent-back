import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Event date: 27 Azar 1404 = December 18, 2025
const EVENT_DATE = '2025-12-18';
const TIMEZONE = 'Asia/Tehran';
const LOCATION = 'Amirkabir University of Technology (Tehran Polytechnic)';

// ==================== EXHIBITORS (Companies) ====================
const exhibitorData = [
  {
    name: 'hamkaran-system',
    title: 'همکاران سیستم',
    description: 'Hamkaran System',
    sponsor: true
  },
  {
    name: 'irancell',
    title: 'ایرانسل',
    description: 'Irancell',
    sponsor: true
  },
  {
    name: 'digikala',
    title: 'دیجی کالا',
    description: 'Digikala',
    sponsor: true
  },
  {
    name: 'mohaimen',
    title: 'مهیمن',
    description: 'Mohaimen',
    sponsor: true
  },
  {
    name: 'bank-melli',
    title: 'بانک ملی',
    description: 'Bank Melli (National Bank of Iran)',
    sponsor: true
  }
];

// ==================== SPEAKERS (Users) ====================
const speakerData = [
  // Morning session speakers
  {
    email: 'khalil.mirkhani@example.com',
    firstname: 'Khalil',
    lastname: 'Mirkhani',
    phone: '09120000001',
    company: null,
    jobTitle: null,
    key: 'khalil-mirkhani'
  },
  {
    email: 'babak.alavi@example.com',
    firstname: 'Seyed Babak',
    lastname: 'Alavi',
    phone: '09120000002',
    company: null,
    jobTitle: null,
    key: 'babak-alavi'
  },
  {
    email: 'ahmad.hassani@example.com',
    firstname: 'Ahmad',
    lastname: 'Hassani Kakhki',
    phone: '09120000003',
    company: 'Hamkaran System',
    jobTitle: null,
    key: 'ahmad-hassani'
  },
  {
    email: 'zohreh.hashemi@example.com',
    firstname: 'Zohreh',
    lastname: 'Hashemi Nasab',
    phone: '09120000004',
    company: 'Hamkaran System',
    jobTitle: null,
    key: 'zohreh-hashemi'
  },
  {
    email: 'shahram.karimi@example.com',
    firstname: 'Shahram',
    lastname: 'Karimi',
    phone: '09120000005',
    company: null,
    jobTitle: null,
    key: 'shahram-karimi'
  },
  {
    email: 'mitra.masoudi@example.com',
    firstname: 'Mitra',
    lastname: 'Masoudi',
    phone: '09120000006',
    company: null,
    jobTitle: null,
    key: 'mitra-masoudi'
  },
  {
    email: 'majid.manouchehri@example.com',
    firstname: 'Majid',
    lastname: 'Manouchehri',
    phone: '09120000007',
    company: null,
    jobTitle: 'Panel Moderator',
    key: 'majid-manouchehri'
  },
  {
    email: 'ali.davari@example.com',
    firstname: 'Ali',
    lastname: 'Davari',
    phone: '09120000008',
    company: null,
    jobTitle: 'Panelist',
    key: 'ali-davari'
  },
  {
    email: 'emad.ghaeni@example.com',
    firstname: 'Emad',
    lastname: 'Ghaeni',
    phone: '09120000009',
    company: null,
    jobTitle: 'Panelist',
    key: 'emad-ghaeni'
  },
  {
    email: 'saeed.roshani@example.com',
    firstname: 'Saeed',
    lastname: 'Roshani',
    phone: '09120000010',
    company: null,
    jobTitle: 'Panelist',
    key: 'saeed-roshani'
  },
  {
    email: 'asiyeh.hatami@example.com',
    firstname: 'Asiyeh',
    lastname: 'Hatami',
    phone: '09120000011',
    company: null,
    jobTitle: 'Panelist',
    key: 'asiyeh-hatami'
  },
  // Afternoon session speakers
  {
    email: 'asal.aghaz@example.com',
    firstname: 'Asal',
    lastname: 'Aghaz',
    phone: '09120000012',
    company: null,
    jobTitle: null,
    key: 'asal-aghaz'
  },
  {
    email: 'mohammadreza.mirzaei@example.com',
    firstname: 'Mohammadreza',
    lastname: 'Mirzaei',
    phone: '09120000013',
    company: null,
    jobTitle: null,
    key: 'mohammadreza-mirzaei'
  },
  {
    email: 'mohammadmahdi.piroozan@example.com',
    firstname: 'Mohammad Mahdi',
    lastname: 'Piroozan',
    phone: '09120000014',
    company: 'Irancell',
    jobTitle: null,
    key: 'mohammadmahdi-piroozan'
  },
  {
    email: 'mahshad.abtahi@example.com',
    firstname: 'Mahshad',
    lastname: 'Abtahi',
    phone: '09120000015',
    company: 'Irancell',
    jobTitle: null,
    key: 'mahshad-abtahi'
  },
  {
    email: 'ali.soltanpanah@example.com',
    firstname: 'Ali',
    lastname: 'Soltan Panah',
    phone: '09120000016',
    company: 'Digikala',
    jobTitle: null,
    key: 'ali-soltanpanah'
  },
  {
    email: 'soheil.azimi@example.com',
    firstname: 'Soheil',
    lastname: 'Azimi',
    phone: '09120000017',
    company: 'Digikala',
    jobTitle: null,
    key: 'soheil-azimi'
  },
  {
    email: 'hanif.salmkar@example.com',
    firstname: 'Hanif',
    lastname: 'Salmkar',
    phone: '09120000018',
    company: 'Mohaimen',
    jobTitle: null,
    key: 'hanif-salmkar'
  },
  {
    email: 'danial.kafi@example.com',
    firstname: 'Danial',
    lastname: 'Kafi',
    phone: '09120000019',
    company: 'Mohaimen',
    jobTitle: null,
    key: 'danial-kafi'
  },
  {
    email: 'jafar.mirzadeh@example.com',
    firstname: 'Seyed Jafar',
    lastname: 'Mirzadeh Mousavi',
    phone: '09120000020',
    company: 'Bank Melli',
    jobTitle: null,
    key: 'jafar-mirzadeh'
  },
  {
    email: 'tavakol.sharafi@example.com',
    firstname: 'Tavakol',
    lastname: 'Sharafi',
    phone: '09120000021',
    company: 'Bank Melli',
    jobTitle: null,
    key: 'tavakol-sharafi'
  }
];

// ==================== EVENTS (Sessions) ====================
const eventData = [
  // Morning Sessions
  {
    name: 'opening-ceremony',
    title: 'آئین افتتاحیه',
    description: 'Opening Ceremony',
    start: `${EVENT_DATE}T08:15:00+03:30`,
    end: `${EVENT_DATE}T08:30:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: [],
    exhibitorName: null,
    tags: ['افتتاحیه', 'ceremony'],
    published: true,
    timed: true,
    order: 1
  },
  {
    name: 'khalil-mirkhani-hr-analytics',
    title: 'تجارب بکارگیری تحلیلگری منابع انسانی',
    description: 'Experiences in Applying HR Analytics - Khalil Mirkhani',
    start: `${EVENT_DATE}T08:30:00+03:30`,
    end: `${EVENT_DATE}T09:00:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['khalil-mirkhani'],
    exhibitorName: null,
    tags: ['تحلیلگری منابع انسانی', 'HR Analytics', 'تجربه'],
    published: true,
    timed: true,
    order: 2
  },
  {
    name: 'babak-alavi-ethics-ai',
    title: 'عاملیت اخلاقی و هوش مصنوعی',
    description: 'Ethical Agency and Artificial Intelligence - Seyed Babak Alavi',
    start: `${EVENT_DATE}T09:00:00+03:30`,
    end: `${EVENT_DATE}T09:30:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['babak-alavi'],
    exhibitorName: null,
    tags: ['هوش مصنوعی', 'AI', 'اخلاق'],
    published: true,
    timed: true,
    order: 3
  },
  {
    name: 'hamkaran-system-data-driven-hr',
    title: 'از مدیریت منابع انسانی داده محور تا داده محوری در خدمت سرمایه انسانی',
    description: 'From Data-Driven HR Management to Data Centrality in Human Capital Service - Hamkaran System',
    start: `${EVENT_DATE}T09:35:00+03:30`,
    end: `${EVENT_DATE}T10:05:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['ahmad-hassani', 'zohreh-hashemi'],
    exhibitorName: 'hamkaran-system',
    tags: ['داده محوری', 'Data-Driven', 'سرمایه انسانی'],
    published: true,
    timed: true,
    order: 4
  },
  {
    name: 'shahram-karimi-international-hr',
    title: 'تجربه های بکارگیری داده محوری کارکنان در شرکت های بین المللی',
    description: 'Experiences in Applying Data-Driven Employee Management in International Companies - Shahram Karimi',
    start: `${EVENT_DATE}T10:05:00+03:30`,
    end: `${EVENT_DATE}T10:35:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['shahram-karimi'],
    exhibitorName: null,
    tags: ['شرکت بین المللی', 'International', 'تجربه'],
    published: true,
    timed: true,
    order: 5
  },
  {
    name: 'mitra-masoudi-hr-analytics-cost',
    title: 'The Power of HR Analytics in an Organization\'s Cost Control',
    description: 'The Power of HR Analytics in an Organization\'s Cost Control - Mitra Masoudi',
    start: `${EVENT_DATE}T10:35:00+03:30`,
    end: `${EVENT_DATE}T11:05:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['mitra-masoudi'],
    exhibitorName: null,
    tags: ['HR Analytics', 'Cost Control', 'Organization'],
    published: true,
    timed: true,
    order: 6
  },
  {
    name: 'morning-networking',
    title: 'شبکه سازی',
    description: 'Networking Break',
    start: `${EVENT_DATE}T11:05:00+03:30`,
    end: `${EVENT_DATE}T11:30:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: [],
    exhibitorName: null,
    tags: ['شبکه سازی', 'Networking'],
    published: true,
    timed: true,
    order: 7
  },
  {
    name: 'panel-discussion-hr-analytics-challenges',
    title: 'چالش های تحلیلگری منابع انسانی در شرکت های ایرانی و بسترهای لازم برای پیاده سازی آن',
    description: 'Challenges of HR Analytics in Iranian Companies and the Necessary Platforms for its Implementation - Panel Discussion',
    start: `${EVENT_DATE}T11:30:00+03:30`,
    end: `${EVENT_DATE}T13:00:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['majid-manouchehri', 'ali-davari', 'emad-ghaeni', 'saeed-roshani', 'asiyeh-hatami'],
    exhibitorName: null,
    tags: ['پنل', 'Panel', 'چالش', 'Challenges'],
    published: true,
    timed: true,
    order: 8
  },
  // Afternoon Sessions
  {
    name: 'ml-hr-analytics-workshop',
    title: 'کارگاه عملی تحلیلگری منابع انسانی با استفاده از ماشین لرنینگ',
    description: 'Practical workshop on HR analytics using machine learning',
    start: `${EVENT_DATE}T14:20:00+03:30`,
    end: `${EVENT_DATE}T15:00:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['asal-aghaz', 'mohammadreza-mirzaei'],
    exhibitorName: null,
    tags: ['کارگاه', 'Workshop', 'Machine Learning', 'ماشین لرنینگ'],
    published: true,
    timed: true,
    order: 9
  },
  {
    name: 'irancell-employee-engagement',
    title: 'سنجش و تحلیل تجربه و تعلق خاطر کارکنان در شرکت ایرانسل',
    description: 'Measuring and analyzing employee experience and engagement at Irancell company',
    start: `${EVENT_DATE}T15:00:00+03:30`,
    end: `${EVENT_DATE}T15:30:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['mohammadmahdi-piroozan', 'mahshad-abtahi'],
    exhibitorName: 'irancell',
    tags: ['تجربه کارکنان', 'Employee Engagement', 'ایرانسل'],
    published: true,
    timed: true,
    order: 10
  },
  {
    name: 'digikala-people-experience',
    title: 'People Experience Journey - Headcount Optimization',
    description: 'People Experience Journey - Headcount Optimization - Digikala',
    start: `${EVENT_DATE}T15:30:00+03:30`,
    end: `${EVENT_DATE}T16:00:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['ali-soltanpanah', 'soheil-azimi'],
    exhibitorName: 'digikala',
    tags: ['People Experience', 'Headcount Optimization', 'دیجی کالا'],
    published: true,
    timed: true,
    order: 11
  },
  {
    name: 'afternoon-networking',
    title: 'شبکه سازی',
    description: 'Networking Break',
    start: `${EVENT_DATE}T16:00:00+03:30`,
    end: `${EVENT_DATE}T16:20:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: [],
    exhibitorName: null,
    tags: ['شبکه سازی', 'Networking'],
    published: true,
    timed: true,
    order: 12
  },
  {
    name: 'mohaimen-hr-data-strategic',
    title: 'تبدیل داده های منابع انسانی به اقدامات راهبردی در سازمان ها',
    description: 'Converting HR data into strategic actions in organizations - Mohaimen',
    start: `${EVENT_DATE}T16:20:00+03:30`,
    end: `${EVENT_DATE}T16:50:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['hanif-salmkar', 'danial-kafi'],
    exhibitorName: 'mohaimen',
    tags: ['داده', 'Strategic Actions', 'سازمان', 'مهیمن'],
    published: true,
    timed: true,
    order: 13
  },
  {
    name: 'bank-melli-talent-analytics',
    title: 'تحلیلگری استعداد با تاکید بر شناسایی استعدادها',
    description: 'Talent analytics with an emphasis on identifying talents - Bank Melli',
    start: `${EVENT_DATE}T16:50:00+03:30`,
    end: `${EVENT_DATE}T17:20:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: ['jafar-mirzadeh', 'tavakol-sharafi'],
    exhibitorName: 'bank-melli',
    tags: ['تحلیلگری استعداد', 'Talent Analytics', 'بانک ملی'],
    published: true,
    timed: true,
    order: 14
  },
  {
    name: 'closing-ceremony',
    title: 'اختتامیه رویداد',
    description: 'Event Closing Ceremony',
    start: `${EVENT_DATE}T17:20:00+03:30`,
    end: `${EVENT_DATE}T17:30:00+03:30`,
    timezone: TIMEZONE,
    location: LOCATION,
    speakerKeys: [],
    exhibitorName: null,
    tags: ['اختتامیه', 'Closing'],
    published: true,
    timed: true,
    order: 15
  }
];

// ==================== SEEDING FUNCTIONS ====================

async function seedExhibitors(adminUserId: string) {
  console.log('🏢 Seeding exhibitors...');
  
  const exhibitorMap = new Map<string, any>();
  let createdCount = 0;
  
  for (const exhibitor of exhibitorData) {
    const existing = await prisma.exhibitor.findFirst({ where: { name: exhibitor.name } });
    if (!existing) {
      const created = await prisma.exhibitor.create({
        data: {
          ...exhibitor,
          createdById: adminUserId
        }
      });
      exhibitorMap.set(exhibitor.name, created);
      createdCount++;
      console.log(`✅ Created exhibitor: ${exhibitor.title} (${exhibitor.name})`);
    } else {
      exhibitorMap.set(exhibitor.name, existing);
      console.log(`ℹ️  Exhibitor already exists: ${exhibitor.title} (${exhibitor.name})`);
    }
  }
  
  console.log(`✅ Processed ${exhibitorData.length} exhibitors (${createdCount} created)`);
  return exhibitorMap;
}

async function seedSpeakers() {
  console.log('👥 Seeding speakers...');
  
  const speakerMap = new Map<string, any>();
  const defaultPassword = 'Speaker@123456';
  const passwordHash = await argon2.hash(defaultPassword);
  let createdCount = 0;
  
  for (const speaker of speakerData) {
    const existing = await prisma.user.findUnique({ where: { email: speaker.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: speaker.email,
          firstname: speaker.firstname,
          lastname: speaker.lastname,
          phone: speaker.phone,
          company: speaker.company || null,
          jobTitle: speaker.jobTitle || null,
          passwordHash,
          role: 'USER'
        }
      });
      speakerMap.set(speaker.key, created);
      createdCount++;
      console.log(`✅ Created speaker: ${speaker.firstname} ${speaker.lastname}`);
    } else {
      speakerMap.set(speaker.key, existing);
      console.log(`ℹ️  Speaker already exists: ${speaker.firstname} ${speaker.lastname}`);
    }
  }
  
  console.log(`✅ Processed ${speakerData.length} speakers (${createdCount} created)`);
  return speakerMap;
}

async function seedEvents(
  adminUserId: string,
  exhibitorMap: Map<string, any>,
  speakerMap: Map<string, any>
) {
  console.log('📅 Seeding events...');
  
  const events: any[] = [];
  let createdCount = 0;
  
  for (const eventInfo of eventData) {
    const existing = await prisma.event.findFirst({ where: { name: eventInfo.name } });
    if (!existing) {
      // Get exhibitor ID if specified
      let exhibitorId = null;
      if (eventInfo.exhibitorName) {
        const exhibitor = exhibitorMap.get(eventInfo.exhibitorName);
        if (exhibitor) exhibitorId = exhibitor.id;
      }

      // Create event
      const created = await prisma.event.create({
        data: {
          name: eventInfo.name,
          title: eventInfo.title,
          description: eventInfo.description,
          start: new Date(eventInfo.start),
          end: new Date(eventInfo.end),
          timezone: eventInfo.timezone,
          location: eventInfo.location,
          timed: eventInfo.timed,
          published: eventInfo.published,
          exhibitorId: exhibitorId,
          createdById: adminUserId
        }
      });

      // Add speakers to event
      for (let i = 0; i < eventInfo.speakerKeys.length; i++) {
        const speakerKey = eventInfo.speakerKeys[i];
        const speaker = speakerMap.get(speakerKey);
        if (speaker) {
          // Check if this is the panel discussion and first speaker (moderator)
          let role = 'SPEAKER';
          if (eventInfo.name === 'panel-discussion-hr-analytics-challenges' && i === 0) {
            role = 'MODERATOR';
          }
          
          await prisma.eventSpeaker.create({
            data: {
              eventId: created.id,
              userId: speaker.id,
              order: i,
              role: role
            }
          });
        }
      }

      // Add tags to event
      for (const tagName of eventInfo.tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        });
        
        await prisma.tagOnEvent.upsert({
          where: {
            tagId_eventId: {
              tagId: tag.id,
              eventId: created.id
            }
          },
          update: {},
          create: {
            tagId: tag.id,
            eventId: created.id
          }
        });
      }

      events.push(created);
      createdCount++;
      console.log(`✅ Created event: ${eventInfo.title}`);
    } else {
      events.push(existing);
      console.log(`ℹ️  Event already exists: ${eventInfo.title}`);
    }
  }
  
  console.log(`✅ Processed ${eventData.length} events (${createdCount} created)`);
  return events;
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🌱 HR Analytics Event - Database Seeding');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📅 Event Date: ${EVENT_DATE} (27 Azar 1404)`);
  console.log(`📍 Location: ${LOCATION}`);
  console.log('');

  try {
    // Get admin user for createdBy
    const adminUser = await prisma.user.findUnique({ where: { email: 'admin@vevent.com' } });
    if (!adminUser) {
      throw new Error('Admin user not found. Please run the main seed script first (npm run seed)');
    }

    // Step 1: Seed Exhibitors
    console.log('📝 Step 1: Seeding Exhibitors');
    console.log('─────────────────────────────────────────────────');
    const exhibitorMap = await seedExhibitors(adminUser.id);
    
    // Step 2: Seed Speakers (Users)
    console.log('');
    console.log('📝 Step 2: Seeding Speakers');
    console.log('─────────────────────────────────────────────────');
    const speakerMap = await seedSpeakers();
    
    // Step 3: Seed Events
    console.log('');
    console.log('📝 Step 3: Seeding Events');
    console.log('─────────────────────────────────────────────────');
    const events = await seedEvents(adminUser.id, exhibitorMap, speakerMap);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 HR Analytics Event Seeding Completed!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`✅ Exhibitors: ${exhibitorData.length} companies`);
    console.log(`✅ Speakers: ${speakerData.length} speakers`);
    console.log(`✅ Events: ${events.length} sessions`);
    console.log('');
    console.log('🚀 HR Analytics Event data is now in the database!');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during seeding:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as seedHrAnalyticsEvent };

