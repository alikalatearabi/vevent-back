import { PrismaClient } from '@prisma/client';
import { seedAdminUser, seedTestUsers } from './seed-users';
import { updateCategoriesWithPersian } from './update-persian-categories';

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🌱 VEvent Database Seeding');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Seed users (admin + test users)
    console.log('📝 Step 1: Seeding Users');
    console.log('─────────────────────────────────────────────────');
    await seedAdminUser();
    await seedTestUsers();
    
    console.log('');
    console.log('📝 Step 2: Seeding Categories, Tags & Products');
    console.log('─────────────────────────────────────────────────');
    await updateCategoriesWithPersian();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Database Seeding Completed Successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Admin User: admin@vevent.com / Admin@123456');
    console.log('✅ Test User: user@vevent.com / User@123456');
    console.log('✅ Categories & Tags: Persian titles added');
    console.log('✅ Products: Categorized and tagged');
    console.log('');
    console.log('🚀 You can now login and test the API!');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error during database seeding:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
