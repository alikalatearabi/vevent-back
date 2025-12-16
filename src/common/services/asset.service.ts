import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MinioService } from './minio.service';

@Injectable()
export class AssetService {
  constructor(
    @Inject('PRISMA') private readonly prisma: PrismaClient,
    private minioService: MinioService,
  ) {}

  async createAsset(
    file: Express.Multer.File,
    folder: string,
    createdBy?: string,
    metadata?: any,
  ) {
    // Upload to MinIO
    const uploadResult = await this.minioService.uploadFile(file, folder);

    // Normalize the URL to ensure it uses the public domain
    const normalizedUrl = this.minioService.normalizeAssetUrl(uploadResult.url);

    // Create asset record in database
    const asset = await this.prisma.asset.create({
      data: {
        url: normalizedUrl, // Use normalized URL
        type: this.getAssetType(file.mimetype),
        meta: {
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          key: uploadResult.key,
          ...metadata,
        },
        createdBy,
      },
    });

    return asset;
  }

  async deleteAsset(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Extract object key from URL and delete from MinIO
    const objectKey = this.minioService.extractObjectKeyFromUrl(asset.url);
    if (objectKey) {
      await this.minioService.deleteFile(objectKey);
    }

    // Soft delete in database
    await this.prisma.asset.update({
      where: { id: assetId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Asset deleted successfully' };
  }

  async linkAssetToProduct(assetId: string, productId: string, role?: string) {
    return this.prisma.assetOnProduct.create({
      data: {
        assetId,
        productId,
        role,
      },
      include: {
        asset: true,
      },
    });
  }

  async linkAssetToExhibitor(assetId: string, exhibitorId: string, role?: string) {
    return this.prisma.assetOnExhibitor.create({
      data: {
        assetId,
        exhibitorId,
        role,
      },
      include: {
        asset: true,
      },
    });
  }

  async linkAssetToEvent(assetId: string, eventId: string, role?: string) {
    return this.prisma.assetOnEvent.create({
      data: {
        assetId,
        eventId,
        role,
      },
      include: {
        asset: true,
      },
    });
  }

  async unlinkAssetFromProduct(assetId: string, productId: string) {
    await this.prisma.assetOnProduct.deleteMany({
      where: {
        assetId,
        productId,
      },
    });
  }

  async unlinkAssetFromExhibitor(assetId: string, exhibitorId: string) {
    await this.prisma.assetOnExhibitor.deleteMany({
      where: {
        assetId,
        exhibitorId,
      },
    });
  }

  async getProductAssets(productId: string) {
    return this.prisma.assetOnProduct.findMany({
      where: { productId },
      include: {
        asset: true,
      },
      orderBy: { role: 'asc' },
    });
  }

  async getExhibitorAssets(exhibitorId: string) {
    return this.prisma.assetOnExhibitor.findMany({
      where: { exhibitorId },
      include: {
        asset: true,
      },
      orderBy: { role: 'asc' },
    });
  }

  private getAssetType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'document';
    return 'file';
  }

  // Validation helpers
  validateImageFile(file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
  }

  validateVideoFile(file: Express.Multer.File) {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
  }
}
