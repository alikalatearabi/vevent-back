import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategoriesAndTags() {
  console.log('🌱 Seeding categories and tags...');

  // Create categories
  const categories = [
    {
      name: 'electronics',
      title: 'Electronics & Technology',
      description: 'Electronic devices, gadgets, and technology products',
      color: '#3B82F6',
      icon: 'fas fa-laptop'
    },
    {
      name: 'fashion',
      title: 'Fashion & Apparel',
      description: 'Clothing, accessories, and fashion items',
      color: '#EC4899',
      icon: 'fas fa-tshirt'
    },
    {
      name: 'home-garden',
      title: 'Home & Garden',
      description: 'Home improvement, furniture, and garden supplies',
      color: '#10B981',
      icon: 'fas fa-home'
    },
    {
      name: 'sports',
      title: 'Sports & Recreation',
      description: 'Sports equipment, fitness gear, and recreational items',
      color: '#F59E0B',
      icon: 'fas fa-dumbbell'
    },
    {
      name: 'books-media',
      title: 'Books & Media',
      description: 'Books, movies, music, and educational materials',
      color: '#8B5CF6',
      icon: 'fas fa-book'
    },
    {
      name: 'automotive',
      title: 'Automotive',
      description: 'Car parts, accessories, and automotive services',
      color: '#EF4444',
      icon: 'fas fa-car'
    },
    {
      name: 'food-beverage',
      title: 'Food & Beverage',
      description: 'Food products, beverages, and culinary items',
      color: '#F97316',
      icon: 'fas fa-utensils'
    },
    {
      name: 'health-beauty',
      title: 'Health & Beauty',
      description: 'Health products, cosmetics, and wellness items',
      color: '#06B6D4',
      icon: 'fas fa-heart'
    },
    {
      name: 'services',
      title: 'Services',
      description: 'Professional services and consultations',
      color: '#6B7280',
      icon: 'fas fa-handshake'
    }
  ];

  const createdCategories: any = {};
  for (const category of categories) {
    const cat = await prisma.category.upsert({
      where: { name: category.name },
      update: category,
      create: category
    });
    createdCategories[category.name] = cat;
  }

  // Create tags
  const tags = [
    { name: 'technology', title: 'Technology', color: '#3B82F6' },
    { name: 'gaming', title: 'Gaming', color: '#10B981' },
    { name: 'premium', title: 'Premium', color: '#F59E0B' },
    { name: 'eco-friendly', title: 'Eco-Friendly', color: '#22C55E' },
    { name: 'bestseller', title: 'Best Seller', color: '#EF4444' },
    { name: 'new-arrival', title: 'New Arrival', color: '#8B5CF6' },
    { name: 'limited-edition', title: 'Limited Edition', color: '#EC4899' },
    { name: 'wireless', title: 'Wireless', color: '#06B6D4' },
    { name: 'portable', title: 'Portable', color: '#F97316' },
    { name: 'professional', title: 'Professional', color: '#6B7280' },
    { name: 'smart', title: 'Smart Device', color: '#3B82F6' },
    { name: 'handmade', title: 'Handmade', color: '#92400E' },
    { name: 'vintage', title: 'Vintage', color: '#7C2D12' },
    { name: 'outdoor', title: 'Outdoor', color: '#059669' },
    { name: 'luxury', title: 'Luxury', color: '#7C3AED' }
  ];

  const createdTags: any = {};
  for (const tag of tags) {
    const t = await prisma.tag.upsert({
      where: { name: tag.name },
      update: tag,
      create: tag
    });
    createdTags[tag.name] = t;
  }

  console.log('✅ Categories and tags seeded successfully!');
  console.log(`📊 Created ${categories.length} categories and ${tags.length} tags`);

  // Update existing products with categories
  console.log('🔄 Assigning categories to existing products...');
  
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, categoryId: true }
  });

  if (products.length > 0) {
    // Map product names to categories
    const categoryMapping: { [key: string]: string } = {
      'electronics': ['laptop', 'phone', 'computer', 'tablet', 'camera', 'headphone', 'speaker', 'monitor', 'keyboard', 'mouse', 'charger', 'cable'],
      'fashion': ['shirt', 't-shirt', 'dress', 'pants', 'shoes', 'jacket', 'bag', 'watch', 'jewelry', 'hat', 'socks', 'belt'],
      'home-garden': ['furniture', 'lamp', 'chair', 'table', 'sofa', 'bed', 'plant', 'tool', 'paint', 'decoration'],
      'sports': ['ball', 'bike', 'fitness', 'gym', 'yoga', 'running', 'swimming', 'tennis', 'golf', 'skateboard'],
      'books-media': ['book', 'magazine', 'cd', 'dvd', 'vinyl', 'comic', 'novel', 'textbook'],
      'automotive': ['car', 'tire', 'oil', 'battery', 'brake', 'engine', 'filter', 'wiper'],
      'food-beverage': ['coffee', 'tea', 'water', 'juice', 'snack', 'chocolate', 'candy', 'wine', 'beer'],
      'health-beauty': ['cream', 'lotion', 'shampoo', 'soap', 'perfume', 'makeup', 'vitamin', 'supplement'],
      'services': ['service', 'consultation', 'repair', 'maintenance', 'installation']
    };

    let updatedCount = 0;
    for (const product of products) {
      if (!product.categoryId) {
        // Find matching category based on product name
        let assignedCategory = 'services'; // default
        
        const productNameLower = product.name.toLowerCase();
        for (const [categoryName, keywords] of Object.entries(categoryMapping)) {
          if (keywords.some(keyword => productNameLower.includes(keyword))) {
            assignedCategory = categoryName;
            break;
          }
        }

        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: createdCategories[assignedCategory].id }
        });
        updatedCount++;
      }
    }
    console.log(`✅ Updated ${updatedCount} products with categories`);
  } else {
    console.log('ℹ️  No existing products to update');
  }
}

async function main() {
  try {
    await seedCategoriesAndTags();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedCategoriesAndTags };
