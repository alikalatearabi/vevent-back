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
    console.log('✅ Seed structure ready - add your data to seed files');
    console.log('💡 Edit seed-users.ts to add admin and test users');
    console.log('💡 Edit update-persian-categories.ts to add categories and tags');
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
