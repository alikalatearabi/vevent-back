import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategoriesWithPersian() {
  console.log('🌱 Updating categories with Persian titles and assigning specific categories to products...');

  // Create/update categories with Persian titles
  const categories = [
    {
      name: 'electronics',
      title: 'الکترونیک و فناوری',
      description: 'دستگاه‌های الکترونیکی، گجت‌ها و محصولات فناوری',
      color: '#3B82F6',
      icon: 'fas fa-laptop'
    },
    {
      name: 'fashion',
      title: 'مد و پوشاک',
      description: 'لباس، اکسسوری و کالاهای مد',
      color: '#EC4899',
      icon: 'fas fa-tshirt'
    },
    {
      name: 'home-garden',
      title: 'خانه و باغ',
      description: 'بهبود خانه، مبلمان و لوازم باغبانی',
      color: '#10B981',
      icon: 'fas fa-home'
    },
    {
      name: 'sports',
      title: 'ورزش و تفریح',
      description: 'تجهیزات ورزشی، لوازم تناسب اندام و اقلام تفریحی',
      color: '#F59E0B',
      icon: 'fas fa-dumbbell'
    },
    {
      name: 'books-media',
      title: 'کتاب و رسانه',
      description: 'کتاب، فیلم، موسیقی و مطالب آموزشی',
      color: '#8B5CF6',
      icon: 'fas fa-book'
    },
    {
      name: 'automotive',
      title: 'خودرو',
      description: 'قطعات خودرو، لوازم جانبی و خدمات خودرویی',
      color: '#EF4444',
      icon: 'fas fa-car'
    },
    {
      name: 'food-beverage',
      title: 'غذا و نوشیدنی',
      description: 'محصولات غذایی، نوشیدنی‌ها و اقلام آشپزی',
      color: '#F97316',
      icon: 'fas fa-utensils'
    },
    {
      name: 'health-beauty',
      title: 'سلامت و زیبایی',
      description: 'محصولات سلامتی، لوازم آرایشی و اقلام تندرستی',
      color: '#06B6D4',
      icon: 'fas fa-heart'
    },
    {
      name: 'services',
      title: 'خدمات',
      description: 'خدمات حرفه‌ای و مشاوره',
      color: '#6B7280',
      icon: 'fas fa-handshake'
    },
    {
      name: 'tech-solutions',
      title: 'راهکارهای فناوری',
      description: 'راهکارهای نرم‌افزاری، سخت‌افزاری و خدمات فناوری اطلاعات',
      color: '#2563EB',
      icon: 'fas fa-microchip'
    },
    {
      name: 'mobile-accessories',
      title: 'لوازم جانبی موبایل',
      description: 'گوشی‌های هوشمند، قاب، شارژر و سایر لوازم جانبی موبایل',
      color: '#9333EA',
      icon: 'fas fa-mobile-alt'
    },
    {
      name: 'data-services',
      title: 'خدمات داده',
      description: 'ذخیره‌سازی، پردازش و تحلیل داده‌ها',
      color: '#0891B2',
      icon: 'fas fa-database'
    },
    {
      name: 'future-tech',
      title: 'فناوری آینده',
      description: 'فناوری‌های نوظهور و راهکارهای پیشرفته',
      color: '#4F46E5',
      icon: 'fas fa-rocket'
    }
  ];

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

  // Create tags with Persian titles
  const tags = [
    { name: 'technology', title: 'فناوری', color: '#3B82F6' },
    { name: 'gaming', title: 'بازی', color: '#10B981' },
    { name: 'premium', title: 'پرمیوم', color: '#F59E0B' },
    { name: 'eco-friendly', title: 'سازگار با محیط زیست', color: '#22C55E' },
    { name: 'bestseller', title: 'پرفروش', color: '#EF4444' },
    { name: 'new-arrival', title: 'جدید', color: '#8B5CF6' },
    { name: 'limited-edition', title: 'نسخه محدود', color: '#EC4899' },
    { name: 'wireless', title: 'بی‌سیم', color: '#06B6D4' },
    { name: 'portable', title: 'قابل حمل', color: '#F97316' },
    { name: 'professional', title: 'حرفه‌ای', color: '#6B7280' },
    { name: 'smart', title: 'هوشمند', color: '#3B82F6' },
    { name: 'handmade', title: 'دست‌ساز', color: '#92400E' },
    { name: 'vintage', title: 'کلاسیک', color: '#7C2D12' },
    { name: 'outdoor', title: 'فضای باز', color: '#059669' },
    { name: 'luxury', title: 'لوکس', color: '#7C3AED' }
  ];

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

  // Update specific products with more relevant categories
  console.log('🔄 Assigning specific categories to products based on exhibitor...');
  
  const exhibitorMapping: { [key: string]: string } = {
    'mobile-frontier': 'mobile-accessories',
    'secure-cloud': 'data-services',
    'data-dynamics': 'data-services',
    'future-systems': 'future-tech',
    'tech-innovations-inc': 'tech-solutions'
  };

  // Get all products
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { exhibitor: true }
  });

  let updatedCount = 0;
  for (const product of products) {
    const exhibitorName = product.exhibitor?.name?.toLowerCase();
    
    if (exhibitorName && exhibitorMapping[exhibitorName]) {
      const categoryName = exhibitorMapping[exhibitorName];
      const category = createdCategories[categoryName];
      
      if (category) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: category.id }
        });
        updatedCount++;
      }
    }
  }

  console.log(`✅ Updated ${updatedCount} products with specific categories based on exhibitor`);

  // Also assign some featured products
  console.log('🔄 Setting some products as featured...');
  
  // Mark every third product as featured
  const featuredProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    take: Math.ceil(products.length / 3),
    orderBy: { createdAt: 'desc' }
  });

  for (const product of featuredProducts) {
    await prisma.product.update({
      where: { id: product.id },
      data: { featured: true }
    });
  }

  console.log(`✅ Set ${featuredProducts.length} products as featured`);

  // Add some tags to products
  console.log('🔄 Adding tags to products...');
  
  // Add technology tag to all products
  const techTag = createdTags['technology'];
  const premiumTag = createdTags['premium'];
  const newTag = createdTags['new-arrival'];
  
  let taggedCount = 0;
  for (const product of products) {
    // Add technology tag to all products
    await prisma.tagOnProduct.upsert({
      where: {
        tagId_productId: {
          tagId: techTag.id,
          productId: product.id
        }
      },
      update: {},
      create: {
        tagId: techTag.id,
        productId: product.id
      }
    });
    
    // Add premium tag to products with price > 500
    if (product.price && parseFloat(product.price.toString()) > 500) {
      await prisma.tagOnProduct.upsert({
        where: {
          tagId_productId: {
            tagId: premiumTag.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          tagId: premiumTag.id,
          productId: product.id
        }
      });
    }
    
    // Add new-arrival tag to recent products (last 3)
    if (products.indexOf(product) < 3) {
      await prisma.tagOnProduct.upsert({
        where: {
          tagId_productId: {
            tagId: newTag.id,
            productId: product.id
          }
        },
        update: {},
        create: {
          tagId: newTag.id,
          productId: product.id
        }
      });
    }
    
    taggedCount++;
  }

  console.log(`✅ Added tags to ${taggedCount} products`);
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
