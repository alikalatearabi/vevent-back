# Persian Categories & Product Enhancement

## 🚀 Run This on Your Server

```bash
# SSH into your server
ssh root@185.149.192.60

# Navigate to your project directory
cd /home/vevent-back

# Pull the latest code
git pull origin main

# Run the Persian categories update script
docker compose exec backend npx tsx prisma/update-persian-categories.ts
```

## ✅ What This Script Does

### 1. Persian Categories
Updates all categories with Persian titles:
- **الکترونیک و فناوری** (Electronics & Technology)
- **مد و پوشاک** (Fashion & Apparel)
- **خانه و باغ** (Home & Garden)
- **ورزش و تفریح** (Sports & Recreation)
- **کتاب و رسانه** (Books & Media)
- **خودرو** (Automotive)
- **غذا و نوشیدنی** (Food & Beverage)
- **سلامت و زیبایی** (Health & Beauty)
- **خدمات** (Services)

### 2. New Tech Categories
Adds specialized tech categories for your exhibitors:
- **راهکارهای فناوری** (Tech Solutions)
- **لوازم جانبی موبایل** (Mobile Accessories)
- **خدمات داده** (Data Services)
- **فناوری آینده** (Future Tech)

### 3. Smart Product Categorization
Assigns products to specific categories based on exhibitor:
- **mobile-frontier** → لوازم جانبی موبایل (Mobile Accessories)
- **secure-cloud** → خدمات داده (Data Services)
- **data-dynamics** → خدمات داده (Data Services)
- **future-systems** → فناوری آینده (Future Tech)
- **tech-innovations-inc** → راهکارهای فناوری (Tech Solutions)

### 4. Persian Tags
Updates all tags with Persian titles:
- **فناوری** (Technology)
- **بازی** (Gaming)
- **پرمیوم** (Premium)
- And more...

### 5. Product Enhancement
- Sets some products as **featured** (every third product)
- Adds **technology** tag to all products
- Adds **premium** tag to expensive products (price > 500)
- Adds **new-arrival** tag to the 3 most recent products

## 🔍 Expected Results

After running the script:

1. All categories will have Persian titles
2. Products will be assigned to specific tech categories based on exhibitor
3. Products will have tags (technology, premium, new-arrival)
4. Some products will be marked as featured

## 📋 Verify It Worked

```bash
# Check products with Persian categories and tags
curl http://localhost:3001/api/v1/products | jq '.data[0] | {name, category, tags, featured}'
```

You should see:
```json
{
  "name": "Product 10",
  "category": {
    "id": "category-uuid",
    "name": "mobile-accessories",
    "title": "لوازم جانبی موبایل",
    "color": "#9333EA",
    "icon": "fas fa-mobile-alt"
  },
  "tags": [
    {
      "id": "tag-uuid",
      "name": "technology",
      "title": "فناوری",
      "color": "#3B82F6"
    },
    {
      "id": "tag-uuid",
      "name": "premium",
      "title": "پرمیوم",
      "color": "#F59E0B"
    }
  ],
  "featured": true
}
```

## 🎉 Benefits

- ✅ Persian language support for categories and tags
- ✅ More specific categories based on exhibitor type
- ✅ Better product organization
- ✅ Featured products for highlighting
- ✅ Proper tagging system
