# Complete Product API Documentation

## 🎉 **All Missing Fields Implemented!**

Your VEvent backend now provides **complete product data** with all the fields your frontend needs to remove mock data.

## ✅ **Implemented Features**

### **1. Enhanced Product Model**
```typescript
{
  id: string,
  name: string,
  title: string,                    // ✅ Display title (auto-generated from name if not provided)
  description: string,
  shortDescription: string,         // ✅ Brief description for cards (auto-generated if not provided)  
  price: number,
  imageUrl: string,                 // ✅ Primary image URL (backward compatibility)
  exhibitorId: string,              // ✅ Proper exhibitor association
  categoryId: string,               // ✅ Category association
  inStock: boolean,                 // ✅ Stock status
  featured: boolean,                // ✅ Featured status
  assets: Asset[],                  // ✅ Multiple images with roles (cover, gallery, thumb)
  tags: Tag[],                      // ✅ Tags with {id, name, title, color}
  category: Category,               // ✅ Full category object
  exhibitor: Exhibitor,             // ✅ Exhibitor details
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Category System**
```typescript
{
  id: string,
  name: string,                     // Unique identifier
  title: string,                    // Display name
  description: string,              // Category description
  color: string,                    // Color code for frontend (#3B82F6)
  icon: string,                     // Icon class (fas fa-laptop)
  parentId?: string,                // For nested categories
  children: Category[],             // Sub-categories
  products: Product[]               // Products in this category
}
```

### **3. Tag System**
```typescript
{
  id: string,
  name: string,                     // Unique identifier
  title: string,                    // Display name
  color: string,                    // Color code for frontend
  _count: {
    products: number,
    events: number,
    exhibitors: number
  }
}
```

## 🚀 **API Endpoints**

### **Enhanced Product APIs**

#### **GET /api/v1/products** - Complete Product List
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/products" \
  -H "Content-Type: application/json"

# Advanced filtering
curl -X GET "http://185.149.192.60:3001/api/v1/products?categoryId=electronics&featured=true&inStock=true&minPrice=100&maxPrice=1000&tags=gaming,premium&sortBy=price&sortOrder=asc" \
  -H "Content-Type: application/json"
```

**Response (Complete Data):**
```json
{
  "data": [
    {
      "id": "product-123",
      "name": "gaming-laptop",
      "title": "Gaming Laptop Pro",                    // ✅ Auto-generated or custom
      "description": "High-performance gaming laptop with RGB keyboard",
      "shortDescription": "High-performance laptop for gaming and work", // ✅ Auto-generated or custom
      "price": 1299.99,                               // ✅ Proper number format
      "imageUrl": "http://185.149.192.60:9000/vevent-assets/products/123/cover.jpg", // ✅ Primary image
      "exhibitorId": "exhibitor-456",                 // ✅ Proper exhibitor ID
      "categoryId": "electronics",                    // ✅ Category ID
      "inStock": true,                                // ✅ Stock status
      "featured": false,                              // ✅ Featured status
      "assets": [                                     // ✅ Multiple images with roles
        {
          "id": "asset-1",
          "url": "http://185.149.192.60:9000/vevent-assets/products/123/cover.jpg",
          "role": "cover",
          "type": "image"
        },
        {
          "id": "asset-2", 
          "url": "http://185.149.192.60:9000/vevent-assets/products/123/gallery-1.jpg",
          "role": "gallery",
          "type": "image"
        }
      ],
      "tags": [                                       // ✅ Tags with full data
        {
          "id": "tag-1",
          "name": "gaming",
          "title": "Gaming Products", 
          "color": "#10B981"
        },
        {
          "id": "tag-2",
          "name": "premium",
          "title": "Premium",
          "color": "#F59E0B"
        }
      ],
      "category": {                                   // ✅ Full category object
        "id": "electronics",
        "name": "electronics",
        "title": "Electronics & Technology",
        "color": "#3B82F6",
        "icon": "fas fa-laptop"
      },
      "exhibitor": {                                  // ✅ Exhibitor details
        "id": "exhibitor-456",
        "name": "Tech Corp",
        "coverUrl": "http://185.149.192.60:9000/vevent-assets/exhibitors/456/logo.jpg"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### **Advanced Filtering Options**
```bash
# Filter by category
curl -X GET "http://185.149.192.60:3001/api/v1/products?categoryId=electronics"

# Filter by stock status
curl -X GET "http://185.149.192.60:3001/api/v1/products?inStock=true"

# Filter by featured products
curl -X GET "http://185.149.192.60:3001/api/v1/products?featured=true"

# Filter by price range
curl -X GET "http://185.149.192.60:3001/api/v1/products?minPrice=100&maxPrice=500"

# Filter by tags (comma-separated)
curl -X GET "http://185.149.192.60:3001/api/v1/products?tags=gaming,premium"

# Sort by different fields
curl -X GET "http://185.149.192.60:3001/api/v1/products?sortBy=price&sortOrder=desc"
curl -X GET "http://185.149.192.60:3001/api/v1/products?sortBy=featured&sortOrder=desc"
```

### **Category Management APIs**

#### **GET /api/v1/categories** - List Categories
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/categories" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "data": [
    {
      "id": "electronics",
      "name": "electronics",
      "title": "Electronics & Technology",
      "description": "Electronic devices, gadgets, and technology products",
      "color": "#3B82F6",
      "icon": "fas fa-laptop",
      "parentId": null,
      "children": [],
      "_count": {
        "products": 25
      }
    }
  ],
  "meta": {
    "total": 9
  }
}
```

#### **POST /api/v1/categories** - Create Category
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "custom-category",
    "title": "Custom Category",
    "description": "My custom product category",
    "color": "#FF6B6B",
    "icon": "fas fa-star"
  }'
```

### **Tag Management APIs**

#### **GET /api/v1/tags** - List Tags
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/tags" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "data": [
    {
      "id": "gaming",
      "name": "gaming",
      "title": "Gaming Products",
      "color": "#10B981",
      "_count": {
        "products": 12,
        "events": 3,
        "exhibitors": 5
      }
    }
  ],
  "meta": {
    "total": 15
  }
}
```

#### **POST /api/v1/tags** - Create Tag
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/tags" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "custom-tag",
    "title": "Custom Tag",
    "color": "#9333EA"
  }'
```

### **Enhanced Product Creation**

#### **POST /api/v1/products** - Create Product with All Fields
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "gaming-laptop",
    "title": "Ultimate Gaming Laptop Pro",
    "description": "High-performance gaming laptop with RTX 4080, 32GB RAM, and RGB keyboard",
    "shortDescription": "Ultimate gaming performance in a portable design",
    "price": "1299.99",
    "imageUrl": "https://example.com/backup-image.jpg",
    "exhibitorId": "exhibitor-uuid",
    "categoryId": "electronics",
    "inStock": true,
    "featured": true,
    "tagIds": ["gaming", "premium", "new-arrival"],
    "assets": ["asset-id-1", "asset-id-2"]
  }'
```

## 📊 **Pre-seeded Data**

Your database now includes:

### **9 Categories:**
1. **Electronics & Technology** (`#3B82F6`, `fas fa-laptop`)
2. **Fashion & Apparel** (`#EC4899`, `fas fa-tshirt`)
3. **Home & Garden** (`#10B981`, `fas fa-home`)
4. **Sports & Recreation** (`#F59E0B`, `fas fa-dumbbell`)
5. **Books & Media** (`#8B5CF6`, `fas fa-book`)
6. **Automotive** (`#EF4444`, `fas fa-car`)
7. **Food & Beverage** (`#F97316`, `fas fa-utensils`)
8. **Health & Beauty** (`#06B6D4`, `fas fa-heart`)
9. **Services** (`#6B7280`, `fas fa-handshake`)

### **15 Tags:**
- Technology, Gaming, Premium, Eco-Friendly, Best Seller
- New Arrival, Limited Edition, Wireless, Portable, Professional
- Smart Device, Handmade, Vintage, Outdoor, Luxury

## 🎯 **Frontend Integration**

Your frontend can now:

### **1. Remove All Mock Data**
```javascript
// ✅ All fields now come from API
const product = {
  id: data.id,
  name: data.name,
  title: data.title,                    // ✅ No more generated titles
  description: data.description,
  shortDescription: data.shortDescription, // ✅ No more truncated descriptions
  price: data.price,                    // ✅ Proper number format
  imageUrl: data.imageUrl,              // ✅ Real image URLs from MinIO
  categoryId: data.categoryId,          // ✅ Real category IDs
  exhibitorId: data.exhibitorId,        // ✅ Real exhibitor associations
  inStock: data.inStock,                // ✅ Real stock status
  featured: data.featured,              // ✅ Real featured status
  tags: data.tags,                      // ✅ Real tags with colors
  category: data.category,              // ✅ Full category object
  assets: data.assets                   // ✅ Multiple real images
};
```

### **2. Use Real Categories**
```javascript
// ✅ Get categories from API instead of hardcoded array
const categories = await fetch('/api/v1/categories').then(r => r.json());
```

### **3. Use Real Tags**
```javascript
// ✅ Get tags from API instead of static "تکنولوژی" 
const tags = await fetch('/api/v1/tags').then(r => r.json());
```

### **4. Advanced Filtering**
```javascript
// ✅ Real filtering capabilities
const filteredProducts = await fetch(`/api/v1/products?categoryId=${categoryId}&featured=true&inStock=true&tags=${selectedTags.join(',')}`);
```

## 🚀 **Ready for Production!**

Your VEvent backend now provides:

✅ **Complete product data** - All fields your frontend needs  
✅ **Real images** - MinIO integration with multiple images per product  
✅ **Category system** - 9 pre-seeded categories with colors and icons  
✅ **Tag system** - 15 pre-seeded tags with colors  
✅ **Advanced filtering** - By category, price, stock, featured status, tags  
✅ **Proper relationships** - Products linked to real exhibitors and categories  
✅ **Auto-generation** - Titles and short descriptions auto-generated when not provided  
✅ **Flexible sorting** - By name, price, date, featured status  

**Your frontend can now completely remove mock data and use real API responses!** 🎉
