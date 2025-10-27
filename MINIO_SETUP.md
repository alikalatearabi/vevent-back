# VEvent Backend - MinIO Image Upload System

## 🚀 Complete MinIO Integration

Your VEvent backend now has a **complete image upload system** with MinIO object storage!

## ✅ What's Been Implemented

### 1. **MinIO Service** (`docker-compose.yml`)
```yaml
minio:
  image: minio/minio:latest
  container_name: vevent-minio
  ports:
    - "9000:9000"      # API
    - "9001:9001"      # Web Console
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin123
  volumes:
    - minio-data:/data
  command: server /data --console-address ":9001"
```

### 2. **Product Image Upload APIs**

#### Upload Multiple Images
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/products/PRODUCT_ID/images" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

#### Upload Cover Image
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/products/PRODUCT_ID/images/cover" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@cover.jpg"
```

#### Get Product Images
```bash
curl -X GET "http://185.149.192.60:3001/api/v1/products/PRODUCT_ID/images"
```

#### Delete Product Image
```bash
curl -X DELETE "http://185.149.192.60:3001/api/v1/products/PRODUCT_ID/images/ASSET_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. **Exhibitor Image Upload APIs**

#### Upload Exhibitor Assets
```bash
curl -X POST "http://185.149.192.60:3001/api/v1/exhibitors/EXHIBITOR_ID/assets" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files=@logo.jpg" \
  -F "files=@banner.jpg"
```

### 4. **MinIO Console Access**
- **URL**: http://185.149.192.60:9001
- **Username**: minioadmin
- **Password**: minioadmin123

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   NestJS API    │    │     MinIO       │
│   (Upload UI)   │───▶│   (Validation)  │───▶│  (File Storage) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │ (Asset Records) │
                       └─────────────────┘
```

## 📁 File Organization

MinIO automatically organizes files by type:
```
vevent-assets/
├── products/
│   ├── product-id-1/
│   │   ├── cover.jpg
│   │   ├── gallery-1.jpg
│   │   └── gallery-2.jpg
│   └── product-id-2/
│       └── image.jpg
├── exhibitors/
│   ├── exhibitor-id-1/
│   │   ├── logo.jpg
│   │   └── banner.jpg
│   └── exhibitor-id-2/
│       └── cover.jpg
└── events/
    └── event-id-1/
        └── banner.jpg
```

## 🔒 Security Features

- ✅ **JWT Authentication** required for uploads
- ✅ **File Type Validation** (JPEG, PNG, WebP, GIF)
- ✅ **File Size Limits** (10MB for images, 100MB for videos)
- ✅ **Public Read Access** for asset URLs
- ✅ **Automatic Bucket Creation** with proper policies

## 🎯 URL Structure

All uploaded images get public URLs like:
```
http://185.149.192.60:9000/vevent-assets/products/uuid/filename.jpg
http://185.149.192.60:9000/vevent-assets/exhibitors/uuid/logo.png
```

## 🚀 Getting Started

### 1. Start the Services
```bash
docker compose up -d
```

### 2. Access MinIO Console
Visit: http://185.149.192.60:9001
- Username: minioadmin
- Password: minioadmin123

### 3. Test Upload
```bash
# Get a token first
TOKEN=$(curl -X POST http://185.149.192.60:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' | jq -r '.accessToken')

# Upload an image
curl -X POST "http://185.149.192.60:3001/api/v1/products/PRODUCT_ID/images" \
  -H "Authorization: Bearer $TOKEN" \
  -F "images=@your-image.jpg"
```

## 📊 Database Integration

The system maintains asset records in PostgreSQL:
```sql
-- Asset table stores file metadata
Asset {
  id: uuid
  url: string  -- MinIO URL
  type: string -- "image", "video", "document"
  meta: json   -- originalName, size, mimeType, key
  createdBy: uuid
  createdAt: datetime
}

-- Junction tables link assets to entities
AssetOnProduct {
  assetId: uuid
  productId: uuid
  role: string -- "cover", "gallery", "thumb"
}
```

## 🎉 Ready for Production!

Your VEvent backend now supports:
- ✅ **Product images** with cover and gallery roles
- ✅ **Exhibitor assets** with flexible roles
- ✅ **Event banners** (ready for implementation)
- ✅ **User avatars** (ready for implementation)
- ✅ **Self-hosted storage** with MinIO
- ✅ **Scalable architecture** ready for millions of files
- ✅ **Cost-effective** - no per-request charges like AWS S3

**Next Steps**: Your frontend can now upload images directly to these endpoints and display them using the returned URLs!
