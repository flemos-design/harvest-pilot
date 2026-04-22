import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });

  // Security
  app.use(helmet());
  app.use(compression());

  // CORS - Allow multiple origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3003',
    'https://bo.harvestpilot.online',
    'https://app.harvestpilot.online',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      // Check if origin is allowed or matches Railway pattern
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global JWT Auth Guard
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // Global prefix (exclude root and health endpoints)
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET },        // GET /
      { path: 'health', method: RequestMethod.GET },  // GET /health
    ],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HarvestPilot API')
    .setDescription('Plataforma de Gestão de Parcelas & Calendário Agrícola')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e autorização')
    .addTag('parcelas', 'Gestão de parcelas')
    .addTag('operacoes', 'Operações de campo')
    .addTag('calendario', 'Calendário e agenda')
    .addTag('meteo', 'Dados meteorológicos')
    .addTag('satelite', 'Imagens de satélite')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'HarvestPilot API Docs',
    customfavIcon: '/public/logo.png',
    customCss: `
      .topbar-wrapper img { content: url('/public/logo.png'); width: 200px; height: auto; }
      .swagger-ui .topbar { background-color: #ffffff; border-bottom: 2px solid #22c55e; }
    `,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🌾 HarvestPilot API running on http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
