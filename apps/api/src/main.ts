import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import hpp from 'hpp';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WafMiddleware } from './common/middleware/waf.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1', { exclude: ['health'] });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://accounts.google.com',
            'https://*.cloudinary.com',
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://*.cloudinary.com',
          ],
          imgSrc: [
            "'self'",
            'data:',
            'blob:',
            'https://*.cloudinary.com',
            'https://api.dicebear.com',
            'https://*.supabase.co',
          ],
          connectSrc: [
            "'self'",
            'https://*.supabase.co',
            'wss://*.supabase.co',
            process.env.FRONTEND_URL || 'http://localhost:4344',
          ].filter(Boolean) as string[],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          frameSrc: ["'self'", 'https://accounts.google.com'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'", 'https://*.cloudinary.com', 'blob:'],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());
  app.use(hpp());

  app.use((req, res, next) => {
    const path = req.originalUrl || req.url || '';
    if (path.includes('/upload/')) return next();
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (contentLength > 1_048_576) {
      return res.status(413).json({
        success: false,
        message: 'Request body too large',
        data: null,
        timestamp: new Date().toISOString(),
      });
    }
    next();
  });

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:4344',
      'http://localhost:4344',
      'http://localhost:4173',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    maxAge: 86400,
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Zenith API')
    .setDescription('Social Media Platform with AI Viral Features')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4345;
  await app.listen(port);
  logger.log(`Server running on port ${port}`);
  logger.log(`API docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
