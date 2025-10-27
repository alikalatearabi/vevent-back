# Fix: Assign Categories to Products

## 🎯 Problem
Products have `null` category values because they were created before the category system was implemented.

## ✅ Solution
Run the enhanced seed script that automatically assigns categories to existing products based on their names.

## 🚀 Run on Server

```bash
# Connect to your server
ssh root@185.149.192.60

# Navigate to project
cd /home/vevent-back

# Pull latest code
git pull origin main

# Run the seed script inside Docker container
docker compose exec backend npx tsx prisma/seed-categories-tags.ts

# OR if you prefer to run it locally on the server
npx tsx prisma/seed-categories-tags.ts
```

## 📊 What It Does

The script will:

1. ✅ Create 9 categories (if they don't exist)
2. ✅ Create 15 tags (if they don't exist)
3. ✅ **Find all products without categories**
4. ✅ **Auto-assign categories based on product names**

### Smart Category Mapping

The script analyzes product names and assigns categories intelligently:

| Category | Keywords Matched |
|----------|-----------------|
| **Electronics** | laptop, phone, computer, tablet, camera, headphone, speaker, monitor, keyboard, mouse, charger, cable |
| **Fashion** | shirt, t-shirt, dress, pants, shoes, jacket, bag, watch, jewelry, hat, socks, belt |
| **Home & Garden** | furniture, lamp, chair, table, sofa, bed, plant, tool, paint, decoration |
| **Sports** | ball, bike, fitness, gym, yoga, running, swimming, tennis, golf, skateboard |
| **Books & Media** | book, magazine, cd, dvd, vinyl, comic, novel, textbook |
| **Automotive** | car, tire, oil, battery, brake, engine, filter, wiper |
| **Food & Beverage** | coffee, tea, water, juice, snack, chocolate, candy, wine, beer |
| **Health & Beauty** | cream, lotion, shampoo, soap, perfume, makeup, vitamin, supplement |
| **Services** | service, consultation, repair, maintenance, installation (default) |

### Example

If you have products named:
- `gaming-laptop` → Will be assigned to **Electronics**
- `event-t-shirt` → Will be assigned to **Fashion**
- `office-chair` → Will be assigned to **Home & Garden**
- `soccer-ball` → Will be assigned to **Sports**

## ✅ Expected Output

```bash
🌱 Seeding categories and tags...
✅ Categories and tags seeded successfully!
📊 Created 9 categories and 15 tags
🔄 Assigning categories to existing products...
✅ Updated 23 products with categories
```

## 🔍 Verify It Worked

After running the script, test the API:

```bash
# Check products now have categories
curl http://localhost:3001/api/v1/products | jq '.data[0].category'
```

You should see:
```json
{
  "id": "category-uuid",
  "name": "electronics",
  "title": "Electronics & Technology",
  "color": "#3B82F6",
  "icon": "fas fa-laptop"
}
```

## 🎉 Result

All your products will now have proper category assignments, and your frontend will display:
- ✅ Real category names instead of null
- ✅ Category colors for visual display
- ✅ Category icons
- ✅ Ability to filter by category

**No more null categories!** 🚀
