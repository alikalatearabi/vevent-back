# 👥 Attendees Seed Documentation

This document describes the attendees seed data that has been created for testing the VEvent attendees API.

## 🌱 Seeded Data Summary

The attendees seed creates comprehensive test data across all events with realistic Persian names, companies, and connection scenarios.

### 📊 Statistics
- **✅ 15 attendees** created across 5 events
- **✅ 5 connection requests** with different statuses
- **✅ Multiple attendee roles** (Speaker, Visitor, Guest, Moderator)
- **✅ Privacy settings variety** for testing different scenarios

---

## 📅 Events & Attendees

### 1. TechSummit 2025 (5 attendees)

**Event ID:** `6c5df3b9-428e-4293-a859-4c18cec49149`

| Name | Role | Company | Job Title | Email | Phone Visible |
|------|------|---------|-----------|-------|---------------|
| احمد محمدی | SPEAKER | شرکت فناوری پیشرفته | مهندس نرم‌افزار ارشد | ahmad.mohammadi@techco.ir | ✅ |
| فاطمه کریمی | VISITOR | استارتاپ نوآوری | مدیر محصول | fateme.karimi@startup.ir | ❌ |
| علی احمدی | VISITOR | دانشگاه تهران | دانشجوی دکتری | ali.ahmadi@university.ac.ir | ✅ |
| مریم رضایی | SPEAKER | شرکت تکنولوژی ایران | توسعه‌دهنده فرانت‌اند | maryam.rezaei@tech.ir | ✅ |
| حسن زارعی | GUEST | فریلنسر | طراح UI/UX | hassan.zarei@freelance.ir | ❌ |

### 2. GreenTech Expo (3 attendees)

**Event ID:** `1f55f523-8cc3-41bb-8c53-efe8e05b8729`

| Name | Role | Company | Job Title | Email | Phone Visible |
|------|------|---------|-----------|-------|---------------|
| زهرا نوری | SPEAKER | انرژی پاک ایران | مهندس محیط زیست | zahra.nouri@green.ir | ✅ |
| رضا صالحی | VISITOR | پنل‌های خورشیدی کیش | مدیر فروش | reza.salehi@solar.ir | ✅ |
| لیلا موسوی | MODERATOR | اکو تک | کارشناس پژوهش | leila.mousavi@eco.ir | ❌ |

### 3. DigitalMarketing Conference (3 attendees)

**Event ID:** `3a330523-a740-4334-b7a4-6fef3be19a19`

| Name | Role | Company | Job Title | Email | Phone Visible |
|------|------|---------|-----------|-------|---------------|
| سارا حسینی | SPEAKER | دیجیتال مارکتینگ پرو | مدیر بازاریابی دیجیتال | sara.hosseini@digital.ir | ✅ |
| محمد رحیمی | VISITOR | آژانس تبلیغاتی کریتیو | کارشناس SEO | mohammad.rahimi@agency.ir | ❌ |
| نیلوفر قاسمی | VISITOR | شبکه‌های اجتماعی ایران | مدیر محتوا | niloofar.ghasemi@social.ir | ✅ |

### 4. HealthTech Innovation (2 attendees)

**Event ID:** `8014369e-90ae-480c-a650-88e564fff010`

| Name | Role | Company | Job Title | Email | Phone Visible |
|------|------|---------|-----------|-------|---------------|
| دکتر مهدی اکبری | SPEAKER | بیمارستان امام خمینی | متخصص قلب و عروق | dr.mehdi.akbari@hospital.ir | ✅ |
| مینا فرهادی | VISITOR | تکنولوژی پزشکی ایران | مهندس پزشکی | mina.farhadi@medtech.ir | ❌ |

### 5. Sustainability Workshop (2 attendees)

**Event ID:** `3e8de47c-3178-44f1-81d0-2aa446d8e712`

| Name | Role | Company | Job Title | Email | Phone Visible |
|------|------|---------|-----------|-------|---------------|
| امیر جعفری | MODERATOR | مرکز توسعه پایدار | مشاور پایداری | amir.jafari@sustainability.ir | ✅ |
| شیرین باقری | GUEST | سازمان محیط زیست | کارشناس محیط زیست | shirin.bagheri@green.ir | ✅ |

---

## 🤝 Connection Requests Test Data

| Requester | Receiver | Event | Status | Message |
|-----------|----------|-------|--------|---------|
| احمد محمدی | فاطمه کریمی | TechSummit | PENDING | سلام، ارائه شما در مورد نوآوری بسیار جالب بود... |
| علی احمدی | مریم رضایی | TechSummit | ACCEPTED | با سلام، در حال انجام پژوهشی در زمینه فرانت‌اند... |
| سارا حسینی | نیلوفر قاسمی | Digital Marketing | PENDING | سلام، می‌خواستم در مورد استراتژی‌های بازاریابی... |
| زهرا نوری | رضا صالحی | GreenTech | REJECTED | با توجه به تجربه شما در پنل‌های خورشیدی... |
| دکتر مهدی اکبری | مینا فرهادی | HealthTech | ACCEPTED | در مورد دستگاه جدید که معرفی کردید... |

---

## 🧪 API Testing Examples

### Get TechSummit 2025 Attendees
```bash
curl -X GET "http://localhost:3001/api/v1/events/6c5df3b9-428e-4293-a859-4c18cec49149/attendees" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:** 5 attendees with mixed roles and privacy settings

### Get Only Speakers from TechSummit
```bash
curl -X GET "http://localhost:3001/api/v1/events/6c5df3b9-428e-4293-a859-4c18cec49149/attendees/speakers" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:** 2 speakers (احمد محمدی, مریم رضایی)

### Get Connection Requests
```bash
curl -X GET "http://localhost:3001/api/v1/connection-requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:** Mix of pending, accepted, and rejected requests

---

## 🎯 Testing Scenarios

### Scenario 1: Privacy Settings Testing
- **زهرا نوری**: Shows all info (phone, company, email)
- **محمد رحیمی**: Hides phone number
- **نیلوفر قاسمی**: Hides company and email
- **حسن زارعی**: Hides phone and company

### Scenario 2: Role-based Filtering
- **Speakers**: Test speaker-only endpoints
- **Visitors**: Most common role, good for general testing
- **Moderators**: Special role for event management
- **Guests**: VIP attendees

### Scenario 3: Connection Request Flows
- **Pending**: احمد → فاطمه (awaiting response)
- **Accepted**: علی → مریم (successful connection)
- **Rejected**: زهرا → رضا (declined request)

### Scenario 4: Multi-language Content
- All attendees have Persian names and company names
- Mix of academic, corporate, and freelance professionals
- Realistic Iranian phone numbers (09XXXXXXXXX format)

---

## 🔄 Re-running the Seed

To regenerate the attendees data:

```bash
# Delete existing attendees and connection requests
DATABASE_URL="postgresql://vevent:veventpass@185.149.192.60:5432/veventdb?schema=public" \
npx prisma db push --reset-database

# Re-run all seeds
DATABASE_URL="postgresql://vevent:veventpass@185.149.192.60:5432/veventdb?schema=public" \
npm run seed

DATABASE_URL="postgresql://vevent:veventpass@185.149.192.60:5432/veventdb?schema=public" \
npm run seed:attendees
```

Or just attendees:

```bash
# Run only attendees seed
npm run seed:attendees
```

---

## 🎨 Customization

To add more attendees or modify the seed data, edit:
- `prisma/seed-attendees.ts` - Main attendee and connection data
- Adjust `attendeeData` array for new attendees
- Modify `connectionRequestScenarios` for different request patterns

---

## 🚀 Production Notes

- **Check-in Status**: Some attendees are randomly checked in
- **Ticket Types**: Automatically assigned based on role
- **Privacy Compliance**: Respects user privacy preferences
- **Realistic Data**: Uses authentic Persian names and companies
- **Phone Validation**: All phones follow Iranian mobile format

---

*Generated on: October 12, 2025*
*Total Attendees: 15 across 5 events*
*Connection Requests: 5 with varied statuses*
