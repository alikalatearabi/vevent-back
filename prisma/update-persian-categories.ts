import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoriesWithPersian() {
  console.log('🌱 Updating categories with Persian titles...');

  // TODO: Add your categories data here
  const categories: Array<{
    name: string;
    title: string;
    description: string;
    color: string;
    icon: string;
  }> = [
    // Example structure (empty for now):
    // {
    //   name: 'electronics',
    //   title: 'الکترونیک و فناوری',
    //   description: 'دستگاه‌های الکترونیکی، گجت‌ها و محصولات فناوری',
    //   color: '#3B82F6',
    //   icon: 'fas fa-laptop'
    // }
  ];

  if (categories.length === 0) {
    console.log('⚠️  No categories configured. Skipping...');
    console.log('💡 Add categories data to update-persian-categories.ts to create categories');
  } else {
    // Create/update all categories
    const createdCategories: any = {};
    for (const category of categories) {
      const cat = await prisma.category.upsert({
        where: { name: category.name },
        update: category,
        create: category
      });
      createdCategories[category.name] = cat;
    }

    console.log('✅ Updated categories with Persian titles');
  }

  // TODO: Add your tags data here
  const tags: Array<{
    name: string;
    title: string;
    color: string;
  }> = [
    // Example structure (empty for now):
    // { name: 'technology', title: 'فناوری', color: '#3B82F6' }
  ];

  if (tags.length === 0) {
    console.log('⚠️  No tags configured. Skipping...');
    console.log('💡 Add tags data to update-persian-categories.ts to create tags');
  } else {
    // Create/update all tags
    const createdTags: any = {};
    for (const tag of tags) {
      const t = await prisma.tag.upsert({
        where: { name: tag.name },
        update: tag,
        create: tag
      });
      createdTags[tag.name] = t;
    }

    console.log('✅ Updated tags with Persian titles');
  }

  console.log('✅ All updates completed successfully!');
}

async function main() {
  try {
    await updateCategoriesWithPersian();
  } catch (error) {
    console.error('❌ Error updating data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { updateCategoriesWithPersian };
