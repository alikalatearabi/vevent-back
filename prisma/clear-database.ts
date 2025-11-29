import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🗑️  Clearing Database');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  try {
    // Delete in order (respecting foreign key constraints)
    console.log('📝 Deleting data...');
    
    // Delete dependent records first
    await prisma.tagOnProduct.deleteMany();
    console.log('✅ Deleted TagOnProduct records');
    
    await prisma.tagOnExhibitor.deleteMany();
    console.log('✅ Deleted TagOnExhibitor records');
    
    await prisma.tagOnEvent.deleteMany();
    console.log('✅ Deleted TagOnEvent records');
    
    await prisma.assetOnProduct.deleteMany();
    console.log('✅ Deleted AssetOnProduct records');
    
    await prisma.assetOnExhibitor.deleteMany();
    console.log('✅ Deleted AssetOnExhibitor records');
    
    await prisma.assetOnEvent.deleteMany();
    console.log('✅ Deleted AssetOnEvent records');
    
    await prisma.payment.deleteMany();
    console.log('✅ Deleted Payment records');
    
    await prisma.attendee.deleteMany();
    console.log('✅ Deleted Attendee records');
    
    await prisma.eventSpeaker.deleteMany();
    console.log('✅ Deleted EventSpeaker records');
    
    await prisma.connectionRequest.deleteMany();
    console.log('✅ Deleted ConnectionRequest records');
    
    await prisma.product.deleteMany();
    console.log('✅ Deleted Product records');
    
    await prisma.exhibitor.deleteMany();
    console.log('✅ Deleted Exhibitor records');
    
    await prisma.event.deleteMany();
    console.log('✅ Deleted Event records');
    
    await prisma.tag.deleteMany();
    console.log('✅ Deleted Tag records');
    
    await prisma.category.deleteMany();
    console.log('✅ Deleted Category records');
    
    await prisma.refreshToken.deleteMany();
    console.log('✅ Deleted RefreshToken records');
    
    await prisma.notification.deleteMany();
    console.log('✅ Deleted Notification records');
    
    await prisma.favorite.deleteMany();
    console.log('✅ Deleted Favorite records');
    
    await prisma.recent.deleteMany();
    console.log('✅ Deleted Recent records');
    
    await prisma.auditLog.deleteMany();
    console.log('✅ Deleted AuditLog records');
    
    await prisma.asset.deleteMany();
    console.log('✅ Deleted Asset records');
    
    await prisma.user.deleteMany();
    console.log('✅ Deleted User records');
    
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Database cleared successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error clearing database:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

