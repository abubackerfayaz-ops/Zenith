import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'cloudinary';
const S3_BUCKET = process.env.S3_BUCKET || 'famewars-media';

export interface UploadOptions {
  folder?: string;
  resize?: { width: number; height: number };
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  generateThumbnail?: boolean;
}

export interface UploadResult {
  url: string;
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  thumbnailUrl?: string;
  blurhash?: string;
  metadata: Record<string, any>;
}

export interface SignedUrlResult {
  url: string;
  key: string;
  expiresAt: Date;
}

async function generateBlurhash(buffer: Buffer): Promise<string> {
  try {
    const { encode } = await import('blurhash');
    const image = sharp(buffer);
    const { width, height } = await image.metadata();
    const resized = await image.resize(32, 32).raw().ensureAlpha().toBuffer();
    return encode(new Uint8ClampedArray(resized), 32, 32, 4, 4);
  } catch {
    return '';
  }
}

async function optimizeImage(buffer: Buffer, options: UploadOptions): Promise<Buffer> {
  let image = sharp(buffer);

  if (options.resize) {
    image = image.resize(options.resize.width, options.resize.height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const format = options.format || 'webp';
  const quality = options.quality || 80;

  switch (format) {
    case 'jpeg':
      image = image.jpeg({ quality });
      break;
    case 'png':
      image = image.png({ quality });
      break;
    case 'webp':
      image = image.webp({ quality });
      break;
    case 'avif':
      image = image.avif({ quality });
      break;
  }

  return image.toBuffer();
}

async function uploadToCloudinary(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
  const folder = options.folder || 'famewars';
  const publicId = `${folder}/${uuid()}`;

  const optimizedBuffer = await optimizeImage(buffer, options);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: 'auto',
        folder,
        format: options.format || 'webp',
        transformation: options.resize
          ? [{ width: options.resize.width, height: options.resize.height, crop: 'limit' }]
          : undefined,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));

        resolve({
          url: result.url,
          publicId: result.public_id,
          secureUrl: result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          metadata: {
            originalFilename: result.original_filename,
            createdAt: result.created_at,
            tags: result.tags,
          },
        });
      }
    );

    const bufferStream = Readable.from(optimizedBuffer);
    bufferStream.pipe(uploadStream);
  });
}

async function uploadToS3(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
  const key = `${options.folder || 'famewars'}/${uuid()}.${options.format || 'webp'}`;
  const optimizedBuffer = await optimizeImage(buffer, options);

  await s3Client.send(new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    Body: optimizedBuffer,
    ContentType: `image/${options.format || 'webp'}`,
  }));

  const metadata = await sharp(buffer).metadata();

  return {
    url: `https://${S3_BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    publicId: key,
    secureUrl: `https://${S3_BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    format: options.format || 'webp',
    width: metadata.width || 0,
    height: metadata.height || 0,
    bytes: optimizedBuffer.length,
    metadata: { key, bucket: S3_BUCKET },
  };
}

export async function uploadMedia(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const upload = STORAGE_PROVIDER === 's3' ? uploadToS3 : uploadToCloudinary;
  const result = await upload(buffer, options);

  if (options.generateThumbnail) {
    const thumbBuffer = await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 60 })
      .toBuffer();

    const thumbOptions = { ...options, folder: `${options.folder || 'famewars'}/thumbnails` };
    const thumbnail = STORAGE_PROVIDER === 's3'
      ? await uploadToS3(thumbBuffer, thumbOptions)
      : await uploadToCloudinary(thumbBuffer, thumbOptions);

    result.thumbnailUrl = thumbnail.secureUrl;
  }

  try {
    const blurhashStr = await generateBlurhash(buffer);
    result.blurhash = blurhashStr;
  } catch {
    result.blurhash = '';
  }

  return result;
}

export async function deleteMedia(publicId: string): Promise<boolean> {
  try {
    if (STORAGE_PROVIDER === 's3') {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: publicId,
      }));
    } else {
      await cloudinary.uploader.destroy(publicId);
    }
    return true;
  } catch (error) {
    console.error('[Media] Delete failed:', error);
    return false;
  }
}

export async function getSignedUploadUrl(key: string, contentType: string): Promise<SignedUrlResult> {
  if (STORAGE_PROVIDER !== 's3') {
    throw new Error('Signed URLs are only available for S3 storage');
  }

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    url,
    key,
    expiresAt: new Date(Date.now() + 3600 * 1000),
  };
}
