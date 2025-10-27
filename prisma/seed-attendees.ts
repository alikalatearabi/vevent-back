import { PrismaClient, AttendeeRole, ConnectionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Sample attendee data for different events
const attendeeData = [
  // TechSummit 2025 Attendees
  {
    eventName: 'TechSummit 2025',
    attendees: [
      {
        firstName: 'احمد',
        lastName: 'محمدی',
        email: 'ahmad.mohammadi@techco.ir',
        phone: '09121234567',
        company: 'شرکت فناوری پیشرفته',
        jobTitle: 'مهندس نرم‌افزار ارشد',
        role: AttendeeRole.SPEAKER,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'فاطمه',
        lastName: 'کریمی',
        email: 'fateme.karimi@startup.ir',
        phone: '09122345678',
        company: 'استارتاپ نوآوری',
        jobTitle: 'مدیر محصول',
        role: AttendeeRole.VISITOR,
        showPhone: false,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'علی',
        lastName: 'احمدی',
        email: 'ali.ahmadi@university.ac.ir',
        phone: '09123456789',
        company: 'دانشگاه تهران',
        jobTitle: 'دانشجوی دکتری',
        role: AttendeeRole.VISITOR,
        showPhone: true,
        showCompany: true,
        showEmail: false,
      },
      {
        firstName: 'مریم',
        lastName: 'رضایی',
        email: 'maryam.rezaei@tech.ir',
        phone: '09124567890',
        company: 'شرکت تکنولوژی ایران',
        jobTitle: 'توسعه‌دهنده فرانت‌اند',
        role: AttendeeRole.SPEAKER,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'حسن',
        lastName: 'زارعی',
        email: 'hassan.zarei@freelance.ir',
        phone: '09125678901',
        company: 'فریلنسر',
        jobTitle: 'طراح UI/UX',
        role: AttendeeRole.GUEST,
        showPhone: false,
        showCompany: false,
        showEmail: true,
      }
    ]
  },
  // GreenTech Expo Attendees
  {
    eventName: 'GreenTech Expo',
    attendees: [
      {
        firstName: 'زهرا',
        lastName: 'نوری',
        email: 'zahra.nouri@green.ir',
        phone: '09126789012',
        company: 'انرژی پاک ایران',
        jobTitle: 'مهندس محیط زیست',
        role: AttendeeRole.SPEAKER,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'رضا',
        lastName: 'صالحی',
        email: 'reza.salehi@solar.ir',
        phone: '09127890123',
        company: 'پنل‌های خورشیدی کیش',
        jobTitle: 'مدیر فروش',
        role: AttendeeRole.VISITOR,
        showPhone: true,
        showCompany: true,
        showEmail: false,
      },
      {
        firstName: 'لیلا',
        lastName: 'موسوی',
        email: 'leila.mousavi@eco.ir',
        phone: '09128901234',
        company: 'اکو تک',
        jobTitle: 'کارشناس پژوهش',
        role: AttendeeRole.MODERATOR,
        showPhone: false,
        showCompany: true,
        showEmail: true,
      }
    ]
  },
  // DigitalMarketing Conference Attendees
  {
    eventName: 'DigitalMarketing Conference',
    attendees: [
      {
        firstName: 'سارا',
        lastName: 'حسینی',
        email: 'sara.hosseini@digital.ir',
        phone: '09129012345',
        company: 'دیجیتال مارکتینگ پرو',
        jobTitle: 'مدیر بازاریابی دیجیتال',
        role: AttendeeRole.SPEAKER,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'محمد',
        lastName: 'رحیمی',
        email: 'mohammad.rahimi@agency.ir',
        phone: '09130123456',
        company: 'آژانس تبلیغاتی کریتیو',
        jobTitle: 'کارشناس SEO',
        role: AttendeeRole.VISITOR,
        showPhone: false,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'نیلوفر',
        lastName: 'قاسمی',
        email: 'niloofar.ghasemi@social.ir',
        phone: '09131234567',
        company: 'شبکه‌های اجتماعی ایران',
        jobTitle: 'مدیر محتوا',
        role: AttendeeRole.VISITOR,
        showPhone: true,
        showCompany: false,
        showEmail: false,
      }
    ]
  },
  // HealthTech Innovation Attendees  
  {
    eventName: 'HealthTech Innovation',
    attendees: [
      {
        firstName: 'دکتر مهدی',
        lastName: 'اکبری',
        email: 'dr.mehdi.akbari@hospital.ir',
        phone: '09132345678',
        company: 'بیمارستان امام خمینی',
        jobTitle: 'متخصص قلب و عروق',
        role: AttendeeRole.SPEAKER,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'مینا',
        lastName: 'فرهادی',
        email: 'mina.farhadi@medtech.ir',
        phone: '09133456789',
        company: 'تکنولوژی پزشکی ایران',
        jobTitle: 'مهندس پزشکی',
        role: AttendeeRole.VISITOR,
        showPhone: false,
        showCompany: true,
        showEmail: true,
      }
    ]
  },
  // Sustainability Workshop Attendees
  {
    eventName: 'Sustainability Workshop',
    attendees: [
      {
        firstName: 'امیر',
        lastName: 'جعفری',
        email: 'amir.jafari@sustainability.ir',
        phone: '09134567890',
        company: 'مرکز توسعه پایدار',
        jobTitle: 'مشاور پایداری',
        role: AttendeeRole.MODERATOR,
        showPhone: true,
        showCompany: true,
        showEmail: true,
      },
      {
        firstName: 'شیرین',
        lastName: 'باقری',
        email: 'shirin.bagheri@green.ir',
        phone: '09135678901',
        company: 'سازمان محیط زیست',
        jobTitle: 'کارشناس محیط زیست',
        role: AttendeeRole.GUEST,
        showPhone: true,
        showCompany: true,
        showEmail: false,
      }
    ]
  }
];

// Connection request scenarios
const connectionRequestScenarios = [
  {
    requesterEmail: 'ahmad.mohammadi@techco.ir',
    receiverEmail: 'fateme.karimi@startup.ir',
    message: 'سلام، ارائه شما در مورد نوآوری بسیار جالب بود. می‌خواستم در مورد همکاری صحبت کنیم.',
    status: ConnectionStatus.PENDING
  },
  {
    requesterEmail: 'ali.ahmadi@university.ac.ir',
    receiverEmail: 'maryam.rezaei@tech.ir',
    message: 'با سلام، در حال انجام پژوهشی در زمینه فرانت‌اند هستم. امکان مشورت وجود دارد؟',
    status: ConnectionStatus.ACCEPTED
  },
  {
    requesterEmail: 'sara.hosseini@digital.ir',
    receiverEmail: 'niloofar.ghasemi@social.ir',
    message: 'سلام، می‌خواستم در مورد استراتژی‌های بازاریابی محتوا صحبت کنیم.',
    status: ConnectionStatus.PENDING
  },
  {
    requesterEmail: 'zahra.nouri@green.ir',
    receiverEmail: 'reza.salehi@solar.ir',
    message: 'با توجه به تجربه شما در پنل‌های خورشیدی، امکان همکاری در پروژه‌ای وجود دارد؟',
    status: ConnectionStatus.REJECTED
  },
  {
    requesterEmail: 'dr.mehdi.akbari@hospital.ir',
    receiverEmail: 'mina.farhadi@medtech.ir',
    message: 'در مورد دستگاه جدید که معرفی کردید می‌خواستم اطلاعات بیشتری بگیرم.',
    status: ConnectionStatus.ACCEPTED
  }
];

async function seedAttendees() {
  console.log('👥 Seeding attendees and connection requests...');
  
  let attendeeCount = 0;
  let connectionRequestCount = 0;

  try {
    // Get all events from database
    const events = await prisma.event.findMany({
      select: { id: true, name: true }
    });

    console.log(`📅 Found ${events.length} events in database`);

    // Create attendees for each event
    for (const eventAttendeeGroup of attendeeData) {
      const event = events.find(e => e.name === eventAttendeeGroup.eventName);
      
      if (!event) {
        console.log(`⚠️  Event "${eventAttendeeGroup.eventName}" not found, skipping...`);
        continue;
      }

      console.log(`\n📝 Creating attendees for event: ${event.name}`);

      for (const attendeeInfo of eventAttendeeGroup.attendees) {
        // Check if attendee already exists for this event
        const existingAttendee = await prisma.attendee.findFirst({
          where: {
            eventId: event.id,
            email: attendeeInfo.email
          }
        });

        if (existingAttendee) {
          console.log(`   ℹ️  Attendee ${attendeeInfo.firstName} ${attendeeInfo.lastName} already exists for ${event.name}`);
          continue;
        }

        // Create attendee
        await prisma.attendee.create({
          data: {
            eventId: event.id,
            firstName: attendeeInfo.firstName,
            lastName: attendeeInfo.lastName,
            email: attendeeInfo.email,
            phone: attendeeInfo.phone,
            company: attendeeInfo.company,
            jobTitle: attendeeInfo.jobTitle,
            role: attendeeInfo.role,
            showPhone: attendeeInfo.showPhone,
            showCompany: attendeeInfo.showCompany,
            showEmail: attendeeInfo.showEmail,
            checkedIn: Math.random() > 0.5, // Randomly check in some attendees
            ticketType: attendeeInfo.role === AttendeeRole.SPEAKER ? 'SPEAKER_PASS' : 
                       attendeeInfo.role === AttendeeRole.GUEST ? 'GUEST_PASS' : 'STANDARD'
          }
        });

        attendeeCount++;
        console.log(`   ✅ Created attendee: ${attendeeInfo.firstName} ${attendeeInfo.lastName} (${attendeeInfo.role})`);
      }
    }

    // Create connection requests
    console.log(`\n🤝 Creating connection requests...`);

    for (const scenario of connectionRequestScenarios) {
      // Find requester and receiver attendees
      const requester = await prisma.attendee.findFirst({
        where: { email: scenario.requesterEmail }
      });

      const receiver = await prisma.attendee.findFirst({
        where: { email: scenario.receiverEmail }
      });

      if (!requester || !receiver) {
        console.log(`   ⚠️  Could not find attendees for connection request: ${scenario.requesterEmail} -> ${scenario.receiverEmail}`);
        continue;
      }

      // Check if connection request already exists
      const existingRequest = await prisma.connectionRequest.findFirst({
        where: {
          requesterId: requester.id,
          receiverId: receiver.id,
          eventId: requester.eventId
        }
      });

      if (existingRequest) {
        console.log(`   ℹ️  Connection request already exists between ${requester.firstName} and ${receiver.firstName}`);
        continue;
      }

      // Create connection request
      const connectionRequest = await prisma.connectionRequest.create({
        data: {
          requesterId: requester.id,
          receiverId: receiver.id,
          eventId: requester.eventId,
          message: scenario.message,
          status: scenario.status,
          responseDateTime: scenario.status !== ConnectionStatus.PENDING ? new Date() : null
        }
      });

      connectionRequestCount++;
      console.log(`   ✅ Created connection request: ${requester.firstName} -> ${receiver.firstName} (${scenario.status})`);
    }

    console.log(`\n═══════════════════════════════════════════════════`);
    console.log(`🎉 Attendees Seeding Completed Successfully!`);
    console.log(`═══════════════════════════════════════════════════`);
    console.log(`✅ Created ${attendeeCount} attendees`);
    console.log(`✅ Created ${connectionRequestCount} connection requests`);
    console.log(`\n📊 Summary by role:`);

    // Get summary by role
    const roleCounts = await prisma.attendee.groupBy({
      by: ['role'],
      _count: true
    });

    roleCounts.forEach(({ role, _count }) => {
      console.log(`   ${role}: ${_count} attendees`);
    });

    // Get connection request status summary
    console.log(`\n🤝 Connection Requests by status:`);
    const statusCounts = await prisma.connectionRequest.groupBy({
      by: ['status'],
      _count: true
    });

    statusCounts.forEach(({ status, _count }) => {
      console.log(`   ${status}: ${_count} requests`);
    });

    console.log(`\n🚀 Database is now ready for attendees API testing!`);

  } catch (error) {
    console.error('❌ Error seeding attendees:', error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting Attendees Seeding...\n');
  
  await seedAttendees();
  
  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
