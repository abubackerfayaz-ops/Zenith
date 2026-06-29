import sharp from 'sharp';

export interface ImageOptimizationOptions {
  sizes: { width: number; height: number; suffix: string }[];
  format: 'jpeg' | 'png' | 'webp' | 'avif';
  quality: number;
  stripMetadata: boolean;
}

export interface ProcessedImage {
  original: { width: number; height: number; size: number; format: string };
  variants: { suffix: string; width: number; height: number; size: number; buffer: Buffer }[];
  metadata: Record<string, any>;
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  codec: string;
  fps: number;
  size: number;
  thumbnail?: Buffer;
}

export async function processImage(
  buffer: Buffer,
  options: Partial<ImageOptimizationOptions> = {}
): Promise<ProcessedImage> {
  const opts: ImageOptimizationOptions = {
    sizes: options.sizes || [
      { width: 150, height: 150, suffix: 'thumb' },
      { width: 640, height: 640, suffix: 'small' },
      { width: 1080, height: 1080, suffix: 'medium' },
      { width: 1920, height: 1920, suffix: 'large' },
    ],
    format: options.format || 'webp',
    quality: options.quality || 80,
    stripMetadata: options.stripMetadata ?? true,
  };

  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (opts.stripMetadata) {
    image.withMetadata({});
  }

  const variants = await Promise.all(
    opts.sizes.map(async (size) => {
      const resized = await sharp(buffer)
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFormat(opts.format, { quality: opts.quality })
        .toBuffer();

      return {
        suffix: size.suffix,
        width: size.width,
        height: size.height,
        size: resized.length,
        buffer: resized,
      };
    })
  );

  return {
    original: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: buffer.length,
      format: metadata.format || 'unknown',
    },
    variants,
    metadata: {
      exif: metadata.exif ? 'present' : 'none',
      icc: metadata.icc ? 'present' : 'none',
      hasAlpha: metadata.hasAlpha || false,
      orientation: metadata.orientation || 1,
      space: metadata.space || 'unknown',
      channels: metadata.channels || 3,
      depth: metadata.depth || '8bit',
    },
  };
}

export async function extractVideoMetadata(
  buffer: Buffer,
  filename: string
): Promise<VideoMetadata> {
  const extension = filename.split('.').pop()?.toLowerCase() || 'mp4';

  const metadata: VideoMetadata = {
    width: 1920,
    height: 1080,
    duration: 0,
    codec: 'h264',
    fps: 30,
    size: buffer.length,
  };

  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) {
    try {
      const frame = await sharp(buffer, { animated: true }).metadata();
      metadata.width = frame.width || 1920;
      metadata.height = frame.height || 1080;

      const thumbnail = await sharp(buffer, { animated: true })
        .resize(640, 360, { fit: 'cover' })
        .webp({ quality: 60 })
        .toBuffer();
      metadata.thumbnail = thumbnail;
    } catch {
      try {
        const thumbnail = await sharp(buffer)
          .resize(640, 360, { fit: 'cover' })
          .webp({ quality: 60 })
          .toBuffer();
        metadata.thumbnail = thumbnail;
      } catch {
        const placeholder = await sharp({
          create: {
            width: 640,
            height: 360,
            channels: 3,
            background: { r: 0, g: 0, b: 0 },
          },
        }).webp().toBuffer();
        metadata.thumbnail = placeholder;
      }
    }
  }

  return metadata;
}

export async function compressImage(
  buffer: Buffer,
  targetSizeKB: number = 200
): Promise<Buffer> {
  let quality = 80;
  let compressed = await sharp(buffer)
    .webp({ quality })
    .toBuffer();

  while (compressed.length > targetSizeKB * 1024 && quality > 10) {
    quality -= 10;
    compressed = await sharp(buffer)
      .webp({ quality })
      .toBuffer();
  }

  return compressed;
}

export async function generateResponsiveImages(
  buffer: Buffer,
  baseFilename: string
): Promise<{ filename: string; buffer: Buffer; width: number; height: number }[]> {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
  const nameWithoutExt = baseFilename.replace(/\.[^/.]+$/, '');

  const results = await Promise.all(
    breakpoints.map(async (width) => {
      const resized = await sharp(buffer)
        .resize(width, undefined, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();

      const meta = await sharp(resized).metadata();

      return {
        filename: `${nameWithoutExt}_w${width}.webp`,
        buffer: resized,
        width: meta.width || width,
        height: meta.height || 0,
      };
    })
  );

  return results.filter(r => r.width > 0);
}
