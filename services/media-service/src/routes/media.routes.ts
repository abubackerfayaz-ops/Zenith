import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadMedia, deleteMedia, getSignedUploadUrl } from '../services/upload.service';
import { processImage, extractVideoMetadata, generateResponsiveImages } from '../services/media-processor';

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
  },
});

mediaRouter.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const options = {
      folder: (req.body.folder as string) || 'famewars',
      resize: req.body.width && req.body.height
        ? { width: parseInt(req.body.width, 10), height: parseInt(req.body.height, 10) }
        : undefined,
      format: (req.body.format as any) || 'webp',
      quality: parseInt(req.body.quality || '80', 10),
      generateThumbnail: req.body.generateThumbnail === 'true',
    };

    const result = await uploadMedia(req.file.buffer, options);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
});

mediaRouter.post('/upload/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: 'No files provided' });
      return;
    }

    const options = {
      folder: (req.body.folder as string) || 'famewars',
      format: (req.body.format as any) || 'webp',
      quality: parseInt(req.body.quality || '80', 10),
      generateThumbnail: req.body.generateThumbnail === 'true',
    };

    const results = await Promise.all(
      files.map(file => uploadMedia(file.buffer, { ...options, originalName: file.originalname }))
    );

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
});

mediaRouter.delete('/:publicId', async (req: Request, res: Response) => {
  try {
    const success = await deleteMedia(req.params.publicId);
    if (success) {
      res.json({ success: true, message: 'Media deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Media not found or delete failed' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Delete failed' });
  }
});

mediaRouter.post('/signed-url', async (req: Request, res: Response) => {
  try {
    const { key, contentType } = req.body;
    if (!key || !contentType) {
      res.status(400).json({ success: false, error: 'key and contentType required' });
      return;
    }
    const result = await getSignedUploadUrl(key, contentType);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to generate signed URL' });
  }
});

mediaRouter.post('/process', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    let processingResult: any;

    if (isVideo) {
      processingResult = await extractVideoMetadata(req.file.buffer, req.file.originalname);
    } else {
      const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : undefined;
      processingResult = await processImage(req.file.buffer, { sizes });
    }

    res.json({ success: true, data: processingResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Processing failed' });
  }
});

mediaRouter.post('/responsive', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file provided' });
      return;
    }

    const variants = await generateResponsiveImages(req.file.buffer, req.file.originalname);
    const variantMeta = variants.map(v => ({
      filename: v.filename,
      width: v.width,
      height: v.height,
      size: v.buffer.length,
    }));

    res.json({ success: true, data: { variants: variantMeta, count: variants.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to generate responsive images' });
  }
});
