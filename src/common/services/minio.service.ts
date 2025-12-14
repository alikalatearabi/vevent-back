import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET', 'vevent-assets');
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost:9000').split(':')[0],
      port: parseInt(this.configService.get('MINIO_ENDPOINT', 'localhost:9000').split(':')[1] || '9000'),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin123'),
    });
  }

  async onModuleInit() {
    // Try to create bucket, but don't fail startup if MinIO is unavailable
    // This allows the app to start even if MinIO is temporarily down
    try {
      await this.createBucketIfNotExists();
    } catch (error) {
      this.logger.warn(
        `MinIO bucket initialization failed. The service will retry on first use. Error: ${error.message}`
      );
      // Don't throw - allow the app to start without MinIO
      // MinIO operations will fail gracefully when attempted
    }
  }

  private async createBucketIfNotExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
        
        // Set bucket policy to allow public read access for assets
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        this.logger.log(`Bucket policy set for public read access`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      this.logger.error(`Error creating bucket: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
    customFileName?: string,
  ): Promise<{ url: string; key: string; originalName: string; size: number; mimeType: string }> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = customFileName || `${uuidv4()}.${fileExtension}`;
      const objectKey = `${folder}/${fileName}`;

      // Upload file to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        objectKey,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'X-Original-Name': file.originalname,
        },
      );

      // Generate public URL - use MINIO_PUBLIC_URL if set, otherwise construct from endpoint
      const publicUrl = this.configService.get('MINIO_PUBLIC_URL');
      let url: string;
      
      if (publicUrl) {
        // Use explicit public URL (useful when MinIO is behind reverse proxy with SSL)
        // Remove trailing slash if present
        const baseUrl = publicUrl.replace(/\/$/, '');
        url = `${baseUrl}/${this.bucketName}/${objectKey}`;
      } else {
        // Fall back to constructing URL from endpoint
      const protocol = this.configService.get('MINIO_USE_SSL', 'false') === 'true' ? 'https' : 'http';
      const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost:9000');
        url = `${protocol}://${endpoint}/${this.bucketName}/${objectKey}`;
      }

      this.logger.log(`File uploaded successfully: ${objectKey}`);

      return {
        url,
        key: objectKey,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(objectKey: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectKey);
      this.logger.log(`File deleted successfully: ${objectKey}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }

  async getFileUrl(objectKey: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, objectKey, expiry);
    } catch (error) {
      this.logger.error(`Error generating file URL: ${error.message}`);
      throw error;
    }
  }

  async listFiles(prefix?: string): Promise<any[]> {
    try {
      const files: any[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj));
        stream.on('error', reject);
        stream.on('end', () => resolve(files));
      });
    } catch (error) {
      this.logger.error(`Error listing files: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload a file from the filesystem to MinIO
   */
  async uploadFileFromPath(
    filePath: string,
    folder: string = 'general',
    customFileName?: string,
    contentType?: string,
  ): Promise<{ url: string; key: string; originalName: string; size: number; mimeType: string }> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      const originalName = path.basename(filePath);
      const fileExtension = originalName.split('.').pop();
      const fileName = customFileName || originalName;
      const objectKey = `${folder}/${fileName}`;

      // Determine content type
      let mimeType = contentType;
      if (!mimeType) {
        if (fileExtension === 'pdf') {
          mimeType = 'application/pdf';
        } else if (['jpg', 'jpeg'].includes(fileExtension.toLowerCase())) {
          mimeType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          mimeType = 'image/png';
        } else {
          mimeType = 'application/octet-stream';
        }
      }

      // Upload file to MinIO
      // Encode original name to handle non-ASCII characters in headers
      const metadata: any = {
        'Content-Type': mimeType,
      };
      
      // Only add original name header if it contains ASCII characters
      // For non-ASCII filenames, we'll skip this header to avoid encoding issues
      try {
        // Try to encode the filename properly
        const encodedName = encodeURIComponent(originalName);
        if (encodedName.length < 256) { // HTTP header value length limit
          metadata['X-Original-Name'] = encodedName;
        }
      } catch {
        // Skip header if encoding fails
      }

      await this.minioClient.putObject(
        this.bucketName,
        objectKey,
        fileBuffer,
        stats.size,
        metadata,
      );

      // Generate public URL
      const publicUrl = this.configService.get('MINIO_PUBLIC_URL');
      let url: string;
      
      if (publicUrl) {
        const baseUrl = publicUrl.replace(/\/$/, '');
        url = `${baseUrl}/${this.bucketName}/${objectKey}`;
      } else {
        const protocol = this.configService.get('MINIO_USE_SSL', 'false') === 'true' ? 'https' : 'http';
        const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost:9000');
        url = `${protocol}://${endpoint}/${this.bucketName}/${objectKey}`;
      }

      this.logger.log(`File uploaded successfully from path: ${objectKey}`);

      return {
        url,
        key: objectKey,
        originalName,
        size: stats.size,
        mimeType,
      };
    } catch (error) {
      this.logger.error(`Error uploading file from path: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get public URL for an object key
   */
  getPublicUrl(objectKey: string): string {
    const publicUrl = this.configService.get('MINIO_PUBLIC_URL');
    
    if (publicUrl) {
      const baseUrl = publicUrl.replace(/\/$/, '');
      return `${baseUrl}/${this.bucketName}/${objectKey}`;
    } else {
      const protocol = this.configService.get('MINIO_USE_SSL', 'false') === 'true' ? 'https' : 'http';
      const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost:9000');
      return `${protocol}://${endpoint}/${this.bucketName}/${objectKey}`;
    }
  }

  // Helper method to extract object key from URL
  extractObjectKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      // Remove bucket name and get the rest as object key
      return pathParts.slice(2).join('/');
    } catch {
      return null;
    }
  }
}
