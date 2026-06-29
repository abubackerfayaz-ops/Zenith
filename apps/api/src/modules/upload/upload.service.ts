import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'zenith' },
        (err, result) => {
          if (err || !result) return reject(err || new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video', folder: 'zenith', chunk_size: 6000000 },
        (err, result) => {
          if (err || !result) return reject(err || new Error('Upload failed'));
          resolve(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
}
