import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as FormData from 'form-data';

const prisma = new PrismaClient();

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNWFiMTc4NC0xODIxLTQ3MjktOGIxYS1mNjM0YzgyZjhkNDUiLCJpYXQiOjE3NjUwMTkwNzUsImV4cCI6MTc2NTAxOTk3NX0.et_fL66n0GqOw6_eDXiq04ycLAbn_wMZZR3iD9jQrNM';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

async function createSponsor() {
  try {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🏢 Creating Nashre Novin Sponsor');
    console.log('═══════════════════════════════════════════════════');
    console.log('');

    // Step 1: Create exhibitor
    console.log('📝 Step 1: Creating exhibitor/sponsor...');
    const exhibitorResponse = await axios.post(
      `${API_BASE}/exhibitors`,
      {
        name: 'شرکت دیده‌بان دانش نوین توسعه',
        title: 'نشر نوین',
        description: 'شرکت دیده‌بان دانش نوین توسعه یا نشر نوین از سال ۱۳۹۲ فعالیت خود را به عنوان ناشری مستقل در زمینۀ نشر کتاب‌ها و مجلات حوزه‌های کسب‌وکار و توسعۀ فردی آغاز کرد.\n\nماموریت ما ارتقاء فرهنگ مطالعۀ ایرانیان و دانش توسعۀ فردی و کسب‌وکار است.\n\nما باور داریم کتاب‌ها و ایده‌هایشان ظرفیت منحصربه‌فردی دارند که می‌توانند ما را هر روز به سمت اندکی بهتر شدن سوق دهند و تغییر را برایمان امکان‌پذیر کنند.',
        website: 'https://nashrenovin.ir/',
        location: 'تهران، خیابان بهشتی، خیابان سرافراز، کوچۀ دوم ب (خبرنگار)، پلاک ۱۵، واحد ۱۲',
        sponsor: true,
        tags: [],
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const exhibitorId = exhibitorResponse.data.id;
    console.log(`✅ Exhibitor created with ID: ${exhibitorId}`);
    console.log(`   Name: ${exhibitorResponse.data.name}`);
    console.log(`   Title: ${exhibitorResponse.data.title}`);

    // Step 2: Upload logo
    console.log('');
    console.log('📤 Step 2: Uploading logo...');
    const logoPath = path.join(__dirname, '../src/assets/Nashre_Novin_Logo.png');
    
    if (!fs.existsSync(logoPath)) {
      throw new Error(`❌ Logo file not found at: ${logoPath}`);
    }

    const fileStats = fs.statSync(logoPath);
    console.log(`   Logo file found: ${logoPath}`);
    console.log(`   File size: ${(fileStats.size / 1024).toFixed(2)} KB`);

    const formData = new FormData();
    formData.append('files', fs.createReadStream(logoPath), {
      filename: 'Nashre_Novin_Logo.png',
      contentType: 'image/png',
    });

    const uploadResponse = await axios.post(
      `${API_BASE}/exhibitors/${exhibitorId}/assets`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    console.log('✅ Logo uploaded successfully!');
    if (uploadResponse.data.assets && uploadResponse.data.assets.length > 0) {
      const asset = uploadResponse.data.assets[0];
      console.log(`   Asset ID: ${asset.id}`);
      console.log(`   Asset URL: ${asset.url}`);
      console.log(`   Role: ${asset.role || 'gallery'}`);
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 Sponsor created and logo uploaded successfully!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`Exhibitor ID: ${exhibitorId}`);
    console.log('');

    // Update the asset role to 'logo' so it appears as logoUrl in the API response
    // The current endpoint sets role to 'gallery' by default
    // The API looks for assets with role 'logo' to display as logoUrl
    if (uploadResponse.data.assets && uploadResponse.data.assets.length > 0) {
      const assetId = uploadResponse.data.assets[0].id;
      const assetLink = await prisma.assetOnExhibitor.findFirst({
        where: {
          exhibitorId: exhibitorId,
          assetId: assetId,
        },
      });

      if (assetLink && assetLink.role !== 'logo') {
        await prisma.assetOnExhibitor.update({
          where: { id: assetLink.id },
          data: { role: 'logo' },
        });
        console.log('✅ Updated asset role to "logo"');
      }
    }

  } catch (error: any) {
    console.error('');
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('   No response received. Is the server running?');
      console.error(`   API Base URL: ${API_BASE}`);
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSponsor();

