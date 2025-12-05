import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Event date: 27 Azar 1404 = December 18, 2025
const EVENT_DATE = '2025-12-18';
const TIMEZONE = 'Asia/Tehran';
const LOCATION = 'Amirkabir University of Technology (Tehran Polytechnic)';

interface ScheduleRow {
  type: string; // سخنران, ارائه تجربه, کارگاه, پنل, or empty
  speakerOrCompany: string;
  topic: string;
  startTime: string; // 12-hour format
  duration: number; // minutes
  endTime: string; // 12-hour format
}

/**
 * Convert 12-hour time format to 24-hour format
 * Example: "8:00:00 AM" -> "08:00:00", "1:15:00 PM" -> "13:15:00"
 */
function convertTo24Hour(time12h: string): string {
  const [time, period] = time12h.trim().split(' ');
  const [hours, minutes, seconds = '00'] = time.split(':');
  
  let hour24 = parseInt(hours, 10);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
}

/**
 * Parse CSV file and return schedule rows
 */
function parseScheduleCSV(): ScheduleRow[] {
  // Resolve path relative to project root
  const csvPath = path.resolve(process.cwd(), 'src/assets/timeTable.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Skip header row
  const dataLines = lines.slice(1);
  
  const schedule: ScheduleRow[] = [];
  
  for (const line of dataLines) {
    const columns = line.split(',');
    
    // CSV columns: [type, speaker/company, topic, startTime, duration, endTime]
    if (columns.length >= 6) {
      schedule.push({
        type: columns[0]?.trim() || '',
        speakerOrCompany: columns[1]?.trim() || '',
        topic: columns[2]?.trim() || '',
        startTime: columns[3]?.trim() || '',
        duration: parseInt(columns[4]?.trim() || '0', 10),
        endTime: columns[5]?.trim() || '',
      });
    }
  }
  
  return schedule;
}

/**
 * Generate event name from schedule row
 */
function generateEventName(row: ScheduleRow, index: number): string {
  const typeMap: Record<string, string> = {
    'سخنران': 'speaker',
    'ارائه تجربه': 'experience',
    'کارگاه': 'workshop',
    'پنل': 'panel',
  };
  
  const typeKey = typeMap[row.type] || 'session';
  const sanitized = row.topic
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, 50);
  
  return `hr-analytics-2025-${typeKey}-${index + 1}-${sanitized}`;
}

/**
 * Generate event title with speaker name included
 */
function generateEventTitle(row: ScheduleRow): string {
  if (!row.type && !row.speakerOrCompany) {
    // Break or ceremony
    return row.topic || 'Break';
  }
  
  if (row.speakerOrCompany && row.topic) {
    return `${row.topic}${row.speakerOrCompany ? ` - ${row.speakerOrCompany}` : ''}`;
  }
  
  return row.topic || row.speakerOrCompany || 'Session';
}

/**
 * Generate event description with speaker/company info
 */
function generateEventDescription(row: ScheduleRow): string {
  const parts: string[] = [];
  
  if (row.type) {
    parts.push(`Type: ${row.type}`);
  }
  
  if (row.speakerOrCompany) {
    parts.push(`Speaker/Company: ${row.speakerOrCompany}`);
  }
  
  if (row.topic) {
    parts.push(`Topic: ${row.topic}`);
  }
  
  parts.push(`Duration: ${row.duration} minutes`);
  
  return parts.join(' | ');
}

async function seedHrAnalyticsEventSessions() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('📅 Creating HR Analytics Event Sessions from CSV');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📅 Event Date: ${EVENT_DATE} (27 Azar 1404)`);
  console.log(`📍 Location: ${LOCATION}`);
  console.log('');

  try {
    // Get or create an admin user for createdBy
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating a temporary admin user...');
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@vevent.temp',
          passwordHash: await argon2.hash('temp123'),
          firstname: 'Admin',
          lastname: 'User',
          phone: '09123456789',
          role: 'ADMIN'
        }
      });
      console.log('✅ Created temporary admin user');
    }

    // Parse CSV file
    console.log('📖 Reading schedule from CSV file...');
    const schedule = parseScheduleCSV();
    console.log(`   Found ${schedule.length} schedule items`);
    console.log('');

    // Delete existing HR Analytics sessions (optional - comment out if you want to keep them)
    console.log('🗑️  Cleaning up existing HR Analytics sessions...');
    const existingSessions = await prisma.event.findMany({
      where: {
        name: {
          startsWith: 'hr-analytics-2025-'
        },
        deletedAt: null
      }
    });
    
    if (existingSessions.length > 0) {
      await prisma.event.deleteMany({
        where: {
          name: {
            startsWith: 'hr-analytics-2025-'
          }
        }
      });
      console.log(`   Deleted ${existingSessions.length} existing sessions`);
    }
    console.log('');

    // Create events for each schedule item
    console.log('📅 Creating event sessions...');
    const createdEvents = [];
    
    for (let i = 0; i < schedule.length; i++) {
      const row = schedule[i];
      
      // Skip empty rows
      if (!row.topic && !row.speakerOrCompany) {
        continue;
      }
      
      // Convert times
      const startTime24h = convertTo24Hour(row.startTime);
      const endTime24h = convertTo24Hour(row.endTime);
      
      // Create date objects
      const startDateTime = new Date(`${EVENT_DATE}T${startTime24h}+03:30`);
      const endDateTime = new Date(`${EVENT_DATE}T${endTime24h}+03:30`);
      
      // Generate event data
      const eventName = generateEventName(row, i);
      const eventTitle = generateEventTitle(row);
      const eventDescription = generateEventDescription(row);
      
      // Create event
      const event = await prisma.event.create({
        data: {
          name: eventName,
          title: eventTitle,
          description: eventDescription,
          start: startDateTime,
          end: endDateTime,
          timezone: TIMEZONE,
          location: LOCATION,
          timed: true,
          published: true,
          createdById: adminUser.id,
          // Only set price for the main event, not individual sessions
          price: null,
          currency: null,
        }
      });
      
      createdEvents.push(event);
      
      // Add tags based on type
      const tags: string[] = ['تحلیل‌گری منابع انسانی', 'HR Analytics'];
      
      if (row.type === 'سخنران') {
        tags.push('سخنرانی', 'Speaker');
      } else if (row.type === 'ارائه تجربه') {
        tags.push('ارائه تجربه', 'Experience');
      } else if (row.type === 'کارگاه') {
        tags.push('کارگاه', 'Workshop');
      } else if (row.type === 'پنل') {
        tags.push('پنل', 'Panel');
      }
      
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName, title: tagName }
        });
        
        await prisma.tagOnEvent.upsert({
          where: {
            tagId_eventId: {
              tagId: tag.id,
              eventId: event.id
            }
          },
          update: {},
          create: {
            tagId: tag.id,
            eventId: event.id
          }
        });
      }
      
      console.log(`   ✅ ${i + 1}. ${eventTitle}`);
      console.log(`      ${row.startTime} - ${row.endTime} (${row.duration} min)`);
      if (row.speakerOrCompany) {
        console.log(`      Speaker/Company: ${row.speakerOrCompany}`);
      }
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`🎉 Created ${createdEvents.length} Event Sessions Successfully!`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('📋 All sessions are now available in the database');
    console.log('   Speaker names are included in event titles/descriptions');
    console.log('   You can link speakers later when they create their profiles');
    console.log('');

    return createdEvents;

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during event session creation:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedHrAnalyticsEventSessions();
}

export { seedHrAnalyticsEventSessions };

