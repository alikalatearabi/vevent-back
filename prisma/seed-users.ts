import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function seedAdminUser() {
  console.log('🌱 Seeding admin user...');

  // Admin user details
  const adminEmail = 'admin@vevent.com';
  const adminPassword = 'Admin@123456'; // Change this in production!
  const adminName = 'Admin User';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists');
    console.log(`📧 Email: ${adminEmail}`);
    return existingAdmin;
  }

  // Hash the password
  const hashedPassword = await argon2.hash(adminPassword);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
      role: 'ADMIN', // Assuming you have a role field, if not this will be ignored
      emailVerified: true, // If you have this field
    }
  });

  console.log('✅ Admin user created successfully!');
  console.log('');
  console.log('📋 Admin Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email:    ${adminEmail}`);
  console.log(`🔑 Password: ${adminPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('⚠️  IMPORTANT: Change the password after first login!');
  console.log('');

  return adminUser;
}

async function seedTestUsers() {
  console.log('🌱 Seeding test users...');

  const testUsers = [
    {
      email: 'user@vevent.com',
      password: 'User@123456',
      name: 'Test User'
    },
    {
      email: 'exhibitor@vevent.com',
      password: 'Exhibitor@123456',
      name: 'Exhibitor User'
    }
  ];

  let createdCount = 0;
  for (const user of testUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!existingUser) {
      const hashedPassword = await argon2.hash(user.password);
      await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          name: user.name,
        }
      });
      createdCount++;
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`ℹ️  User already exists: ${user.email}`);
    }
  }

  if (createdCount > 0) {
    console.log('');
    console.log('📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    for (const user of testUsers) {
      console.log(`📧 ${user.email} / 🔑 ${user.password}`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  console.log(`\n✅ Seeded ${createdCount} test users`);
}

async function main() {
  try {
    await seedAdminUser();
    await seedTestUsers();
    
    console.log('');
    console.log('🎉 All users seeded successfully!');
    console.log('');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedAdminUser, seedTestUsers };
