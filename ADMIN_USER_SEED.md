# Admin User & Complete Database Seeding

## 🚀 Quick Start - Seed Everything

On your server, run this single command to seed users, categories, tags, and products:

```bash
cd /home/vevent-back
git pull origin main
npm run seed
```

## 👤 Admin User Credentials

After seeding, you can login with:

```
📧 Email:    admin@vevent.com
🔑 Password: Admin@123456
```

⚠️ **Important**: Change this password after first login in production!

## 🧪 Test Users

Also created for testing:

```
📧 user@vevent.com / 🔑 User@123456
📧 exhibitor@vevent.com / 🔑 Exhibitor@123456
```

## 📋 What Gets Seeded

### 1. Users (3 users)
- ✅ Admin user with hashed password
- ✅ Regular test user
- ✅ Exhibitor test user

### 2. Categories (13 categories)
- ✅ All with Persian titles
- ✅ Tech-specific categories (راهکارهای فناوری, لوازم جانبی موبایل, etc.)
- ✅ Colors and icons for frontend display

### 3. Tags (15 tags)
- ✅ All with Persian titles (فناوری, پرمیوم, جدید, etc.)
- ✅ Colors for visual display

### 4. Products Enhancement
- ✅ Assigns proper categories to existing products based on exhibitor
- ✅ Adds tags to products (technology, premium, new-arrival)
- ✅ Sets featured products
- ✅ All products now have Persian categories

## 🛠️ Individual Seed Commands

If you want to run specific seeds only:

```bash
# Seed users only
npm run seed:users

# Seed categories, tags, and update products only
npm run seed:categories

# Or run everything together
npm run seed
```

## 🔍 Verify Admin User

Test login with admin credentials:

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vevent.com",
    "password": "Admin@123456"
  }'
```

You should get back:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@vevent.com",
    "name": "Admin User"
  }
}
```

## 📊 Expected Console Output

When running `npm run seed`, you'll see:

```
═══════════════════════════════════════════════════
🌱 VEvent Database Seeding
═══════════════════════════════════════════════════

📝 Step 1: Seeding Users
─────────────────────────────────────────────────
🌱 Seeding admin user...
✅ Admin user created successfully!

📋 Admin Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:    admin@vevent.com
🔑 Password: Admin@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Change the password after first login!

🌱 Seeding test users...
✅ Created user: user@vevent.com
✅ Created user: exhibitor@vevent.com

📋 Test User Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 user@vevent.com / 🔑 User@123456
📧 exhibitor@vevent.com / 🔑 Exhibitor@123456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Seeded 2 test users

📝 Step 2: Seeding Categories, Tags & Products
─────────────────────────────────────────────────
🌱 Updating categories with Persian titles...
✅ Updated categories with Persian titles
✅ Updated tags with Persian titles
✅ Updated 11 products with specific categories
✅ Set 4 products as featured
✅ Added tags to 11 products

═══════════════════════════════════════════════════
🎉 Database Seeding Completed Successfully!
═══════════════════════════════════════════════════

✅ Admin User: admin@vevent.com / Admin@123456
✅ Test User: user@vevent.com / User@123456
✅ Categories & Tags: Persian titles added
✅ Products: Categorized and tagged

🚀 You can now login and test the API!
```

## 🔐 Security Notes

1. **Change default passwords** in production
2. All passwords are hashed with argon2 (secure)
3. Script checks for existing users (won't create duplicates)
4. Email is unique (cannot create multiple users with same email)

## 🎯 What This Solves

- ✅ No more manual user creation
- ✅ Admin access for testing and management
- ✅ All products now have Persian categories
- ✅ Products properly tagged and categorized
- ✅ Ready for frontend integration
- ✅ Complete database ready for testing

## 🚀 Next Steps

After seeding:

1. Login with admin credentials
2. Test all endpoints with authentication
3. Create real exhibitors and products
4. Change admin password
5. Create additional admin users as needed
