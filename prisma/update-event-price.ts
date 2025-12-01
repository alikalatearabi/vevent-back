import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const eventName = process.argv[2] || 'hr-analytics-event-2025';
  const newPrice = process.argv[3] ? parseFloat(process.argv[3]) : 55000000;
  
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('💰 Updating Event Price');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`📅 Event Name: ${eventName}`);
  console.log(`💰 New Price: ${newPrice.toLocaleString('en-US')} IRR`);
  console.log('');

  try {
    // Find the event
    const event = await prisma.event.findFirst({
      where: {
        name: eventName,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        title: true,
        price: true,
        currency: true,
      },
    });

    if (!event) {
      console.log('❌ Event not found');
      console.log('');
      return;
    }

    console.log('✅ Event Found:');
    console.log(`   ID: ${event.id}`);
    console.log(`   Title: ${event.title}`);
    console.log(`   Current Price: ${event.price ? event.price.toNumber().toLocaleString('en-US') : 'N/A'} ${event.currency || 'IRR'}`);
    console.log('');

    // Update the price
    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: {
        price: newPrice,
        currency: 'IRR',
      },
    });

    console.log('✅ Price Updated Successfully!');
    console.log(`   New Price: ${updatedEvent.price?.toNumber().toLocaleString('en-US')} ${updatedEvent.currency || 'IRR'}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Update Complete!');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════');
    console.error('❌ Error:');
    console.error('═══════════════════════════════════════════════════');
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

