import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// Sample data for seeding
const exhibitorData = [
  {
    name: 'TechNova Solutions',
    title: 'Leading Technology Solutions Provider',
    description: 'TechNova Solutions is a cutting-edge technology company specializing in AI, IoT, and cloud solutions for modern businesses.',
    website: 'https://technova-solutions.com',
    location: 'Tehran, Iran',
    sponsor: true
  },
  {
    name: 'Green Energy Corp',
    title: 'Sustainable Energy Innovation',
    description: 'Pioneering renewable energy solutions with solar, wind, and hybrid power systems for a sustainable future.',
    website: 'https://greenenergy-corp.com',
    location: 'Isfahan, Iran',
    sponsor: false
  },
  {
    name: 'Digital Marketing Hub',
    title: 'Your Digital Growth Partner',
    description: 'Complete digital marketing services including SEO, social media management, and content marketing strategies.',
    website: 'https://digitalmarketing-hub.com',
    location: 'Shiraz, Iran',
    sponsor: true
  },
  {
    name: 'MedTech Innovations',
    title: 'Healthcare Technology Solutions',
    description: 'Advanced medical devices and healthcare management systems for hospitals and clinics.',
    website: 'https://medtech-innovations.com',
    location: 'Mashhad, Iran',
    sponsor: false
  },
  {
    name: 'EcoFriendly Products',
    title: 'Sustainable Living Solutions',
    description: 'Eco-friendly products for sustainable living including biodegradable packaging and organic materials.',
    website: 'https://ecofriendly-products.com',
    location: 'Tabriz, Iran',
    sponsor: false
  }
];

const eventData = [
  {
    name: 'TechSummit 2025',
    title: 'Technology Innovation Summit',
    description: 'Annual technology summit featuring the latest innovations in AI, blockchain, and emerging technologies.',
    start: new Date('2025-11-15T09:00:00.000Z'),
    end: new Date('2025-11-15T18:00:00.000Z'),
    location: 'Tehran International Convention Center',
    timezone: 'Asia/Tehran',
    published: true,
    color: '#2563eb'
  },
  {
    name: 'GreenTech Expo',
    title: 'Sustainable Technology Exhibition',
    description: 'Showcase of green technologies and sustainable solutions for environmental challenges.',
    start: new Date('2025-11-20T10:00:00.000Z'),
    end: new Date('2025-11-22T17:00:00.000Z'),
    location: 'Isfahan Exhibition Center',
    timezone: 'Asia/Tehran',
    published: true,
    color: '#16a34a'
  },
  {
    name: 'DigitalMarketing Conference',
    title: 'Digital Marketing Strategies 2025',
    description: 'Learn about the latest digital marketing trends, tools, and strategies from industry experts.',
    start: new Date('2025-12-01T09:30:00.000Z'),
    end: new Date('2025-12-01T16:30:00.000Z'),
    location: 'Shiraz Business Complex',
    timezone: 'Asia/Tehran',
    published: true,
    color: '#dc2626'
  },
  {
    name: 'HealthTech Innovation',
    title: 'Healthcare Technology Forum',
    description: 'Exploring innovations in healthcare technology and medical device advancements.',
    start: new Date('2025-12-10T08:00:00.000Z'),
    end: new Date('2025-12-11T17:00:00.000Z'),
    location: 'Mashhad Medical Center',
    timezone: 'Asia/Tehran',
    published: true,
    color: '#7c3aed'
  },
  {
    name: 'Sustainability Workshop',
    title: 'Building Sustainable Businesses',
    description: 'Workshop on implementing sustainable practices in business operations and product development.',
    start: new Date('2025-12-15T10:00:00.000Z'),
    end: new Date('2025-12-15T15:00:00.000Z'),
    location: 'Tabriz University',
    timezone: 'Asia/Tehran',
    published: true,
    color: '#059669'
  }
];

const productData = [
  // TechNova Solutions products
  {
    name: 'AI Analytics Platform',
    title: 'Advanced AI-Powered Business Analytics',
    description: 'Comprehensive analytics platform using artificial intelligence to provide deep business insights and predictive analytics.',
    shortDescription: 'AI-powered business analytics and insights platform',
    price: 2500000.00,
    inStock: true,
    featured: true
  },
  {
    name: 'IoT Smart Sensors',
    title: 'Industrial IoT Monitoring Solutions',
    description: 'Smart IoT sensors for industrial monitoring, environmental tracking, and automated data collection.',
    shortDescription: 'Industrial IoT sensors for smart monitoring',
    price: 150000.00,
    inStock: true,
    featured: false
  },
  {
    name: 'Cloud Migration Service',
    title: 'Enterprise Cloud Migration Solutions',
    description: 'Complete cloud migration services for enterprises moving from on-premises to cloud infrastructure.',
    shortDescription: 'Professional cloud migration services',
    price: 5000000.00,
    inStock: true,
    featured: true
  },
  
  // Green Energy Corp products
  {
    name: 'Solar Panel System',
    title: 'High-Efficiency Solar Energy System',
    description: 'Complete solar panel system with high-efficiency panels, inverters, and monitoring capabilities.',
    shortDescription: 'Complete solar energy system for homes and businesses',
    price: 8000000.00,
    inStock: true,
    featured: true
  },
  {
    name: 'Wind Turbine Generator',
    title: 'Small-Scale Wind Power Generator',
    description: 'Compact wind turbine generator suitable for residential and small commercial applications.',
    shortDescription: 'Compact wind power generator',
    price: 12000000.00,
    inStock: true,
    featured: false
  },
  
  // Digital Marketing Hub products
  {
    name: 'SEO Optimization Package',
    title: 'Complete SEO and Website Optimization',
    description: 'Comprehensive SEO package including keyword research, content optimization, and technical SEO improvements.',
    shortDescription: 'Professional SEO optimization services',
    price: 800000.00,
    inStock: true,
    featured: true
  },
  {
    name: 'Social Media Management',
    title: 'Professional Social Media Marketing',
    description: 'Complete social media management including content creation, scheduling, and engagement strategies.',
    shortDescription: 'Professional social media marketing services',
    price: 600000.00,
    inStock: true,
    featured: false
  },
  
  // MedTech Innovations products
  {
    name: 'Digital Stethoscope',
    title: 'Advanced Digital Diagnostic Stethoscope',
    description: 'High-precision digital stethoscope with wireless connectivity and AI-assisted diagnosis capabilities.',
    shortDescription: 'AI-powered digital stethoscope for medical diagnosis',
    price: 3500000.00,
    inStock: true,
    featured: true
  },
  {
    name: 'Patient Monitoring System',
    title: 'Wireless Patient Vital Signs Monitor',
    description: 'Wireless monitoring system for tracking patient vital signs with real-time alerts and data logging.',
    shortDescription: 'Wireless patient vital signs monitoring',
    price: 15000000.00,
    inStock: true,
    featured: true
  },
  
  // EcoFriendly Products
  {
    name: 'Biodegradable Packaging',
    title: 'Eco-Friendly Packaging Solutions',
    description: 'Biodegradable packaging materials made from sustainable resources for environmentally conscious businesses.',
    shortDescription: 'Sustainable biodegradable packaging materials',
    price: 50000.00,
    inStock: true,
    featured: false
  },
  {
    name: 'Organic Cleaning Products',
    title: 'Natural and Organic Cleaning Supplies',
    description: 'Complete line of organic cleaning products free from harmful chemicals and safe for the environment.',
    shortDescription: 'Natural organic cleaning products',
    price: 75000.00,
    inStock: true,
    featured: false
  }
];

const userData = [
  {
    email: 'john.doe@techcompany.com',
    firstname: 'John',
    lastname: 'Doe',
    phone: '09121234567',
    company: 'Tech Innovations Inc.',
    jobTitle: 'Senior Software Engineer',
    password: 'User123456'
  },
  {
    email: 'sarah.wilson@marketing.com',
    firstname: 'Sarah',
    lastname: 'Wilson',
    phone: '09122345678',
    company: 'Digital Marketing Pro',
    jobTitle: 'Marketing Manager',
    password: 'User123456'
  },
  {
    email: 'ahmed.hassan@startup.com',
    firstname: 'Ahmed',
    lastname: 'Hassan',
    phone: '09123456789',
    company: 'GreenTech Startup',
    jobTitle: 'Product Manager',
    password: 'User123456'
  },
  {
    email: 'fatima.karimi@hospital.ir',
    firstname: 'Fatima',
    lastname: 'Karimi',
    phone: '09124567890',
    company: 'Tehran Medical Center',
    jobTitle: 'Medical Device Specialist',
    password: 'User123456'
  },
  {
    email: 'ali.mohammadi@university.ac.ir',
    firstname: 'Ali',
    lastname: 'Mohammadi',
    phone: '09125678901',
    company: 'Tehran University',
    jobTitle: 'Research Assistant',
    password: 'User123456'
  },
  {
    email: 'mary.johnson@consultant.com',
    firstname: 'Mary',
    lastname: 'Johnson',
    phone: '09126789012',
    company: 'Business Consultants Ltd.',
    jobTitle: 'Senior Consultant',
    password: 'User123456'
  }
];

async function seedUsers() {
  console.log('👥 Seeding additional users...');
  
  let createdCount = 0;
  for (const user of userData) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      const passwordHash = await argon2.hash(user.password);
      await prisma.user.create({
        data: {
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          company: user.company,
          jobTitle: user.jobTitle,
          passwordHash,
          role: 'USER'
        }
      });
      createdCount++;
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`ℹ️  User already exists: ${user.email}`);
    }
  }
  
  console.log(`✅ Seeded ${createdCount} additional users`);
  return createdCount;
}

async function seedExhibitors() {
  console.log('🏢 Seeding exhibitors...');
  
  // Get admin user for createdBy
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@vevent.com' } });
  if (!adminUser) throw new Error('Admin user not found. Please seed users first.');
  
  const exhibitors: any[] = [];
  let createdCount = 0;
  
  for (const exhibitor of exhibitorData) {
    const existing = await prisma.exhibitor.findFirst({ where: { name: exhibitor.name } });
    if (!existing) {
      const created = await prisma.exhibitor.create({
        data: {
          ...exhibitor,
          createdById: adminUser.id
        }
      });
      exhibitors.push(created);
      createdCount++;
      console.log(`✅ Created exhibitor: ${exhibitor.name}`);
    } else {
      exhibitors.push(existing);
      console.log(`ℹ️  Exhibitor already exists: ${exhibitor.name}`);
    }
  }
  
  console.log(`✅ Seeded ${createdCount} exhibitors`);
  return exhibitors;
}

async function seedEvents(exhibitors: any[]) {
  console.log('📅 Seeding events...');
  
  // Get admin user for createdBy
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@vevent.com' } });
  if (!adminUser) throw new Error('Admin user not found. Please seed users first.');
  
  const events: any[] = [];
  let createdCount = 0;
  
  for (let i = 0; i < eventData.length; i++) {
    const event = eventData[i];
    const existing = await prisma.event.findFirst({ where: { name: event.name } });
    if (!existing) {
      const created = await prisma.event.create({
        data: {
          ...event,
          createdById: adminUser.id,
          exhibitorId: exhibitors[i % exhibitors.length]?.id // Rotate through exhibitors
        }
      });
      events.push(created);
      createdCount++;
      console.log(`✅ Created event: ${event.name}`);
    } else {
      events.push(existing);
      console.log(`ℹ️  Event already exists: ${event.name}`);
    }
  }
  
  console.log(`✅ Seeded ${createdCount} events`);
  return events;
}

async function seedProducts(exhibitors: any[]) {
  console.log('📦 Seeding products...');
  
  let createdCount = 0;
  let productIndex = 0;
  
  // Distribute products among exhibitors
  const productsPerExhibitor = Math.ceil(productData.length / exhibitors.length);
  
  for (let i = 0; i < exhibitors.length; i++) {
    const exhibitor = exhibitors[i];
    const exhibitorProducts = productData.slice(productIndex, productIndex + productsPerExhibitor);
    
    for (const product of exhibitorProducts) {
      const existing = await prisma.product.findFirst({
        where: { 
          name: product.name,
          exhibitorId: exhibitor.id
        }
      });
      
      if (!existing) {
        await prisma.product.create({
          data: {
            ...product,
            exhibitorId: exhibitor.id
          }
        });
        createdCount++;
        console.log(`✅ Created product: ${product.name} for ${exhibitor.name}`);
      } else {
        console.log(`ℹ️  Product already exists: ${product.name}`);
      }
    }
    
    productIndex += productsPerExhibitor;
  }
  
  console.log(`✅ Seeded ${createdCount} products`);
  return createdCount;
}

async function seedAttendees(events: any[]) {
  console.log('🎫 Seeding event attendees...');
  
  // Get some users to make attendees
  const users = await prisma.user.findMany({ 
    where: { role: 'USER' },
    take: 10
  });
  
  let createdCount = 0;
  
  for (const event of events) {
    // Add 2-4 random attendees per event
    const attendeeCount = Math.floor(Math.random() * 3) + 2;
    const selectedUsers = users.slice(0, attendeeCount);
    
    for (const user of selectedUsers) {
      const existing = await prisma.attendee.findFirst({
        where: {
          eventId: event.id,
          userId: user.id
        }
      });
      
      if (!existing) {
        await prisma.attendee.create({
          data: {
            eventId: event.id,
            userId: user.id,
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            ticketType: Math.random() > 0.5 ? 'VIP' : 'Regular',
            checkedIn: Math.random() > 0.7 // 30% chance of being checked in
          }
        });
        createdCount++;
        console.log(`✅ Added attendee: ${user.firstname} ${user.lastname} to ${event.name}`);
      }
    }
  }
  
  console.log(`✅ Seeded ${createdCount} attendees`);
  return createdCount;
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🌱 VEvent Comprehensive Database Seeding');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Step 1: Additional Users
    console.log('📝 Step 1: Seeding Users');
    console.log('─────────────────────────────────────────────────');
    await seedUsers();
    
    console.log('');
    console.log('📝 Step 2: Seeding Exhibitors');
    console.log('─────────────────────────────────────────────────');
    const exhibitors = await seedExhibitors();
    
    console.log('');
    console.log('📝 Step 3: Seeding Events');
    console.log('─────────────────────────────────────────────────');
    const events = await seedEvents(exhibitors);
    
    console.log('');
    console.log('📝 Step 4: Seeding Products');
    console.log('─────────────────────────────────────────────────');
    await seedProducts(exhibitors);
    
    console.log('');
    console.log('📝 Step 5: Seeding Attendees');
    console.log('─────────────────────────────────────────────────');
    await seedAttendees(events);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Comprehensive Database Seeding Completed!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Users: 6 additional users created');
    console.log('✅ Exhibitors: 5 companies (3 sponsors, 2 regular)');
    console.log('✅ Events: 5 events scheduled');
    console.log('✅ Products: 11 products across all exhibitors');
    console.log('✅ Attendees: Multiple attendees per event');
    console.log('');
    console.log('🚀 Database is now fully populated for testing!');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during comprehensive seeding:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
