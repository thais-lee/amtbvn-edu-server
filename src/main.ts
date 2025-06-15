import { NestApplicationOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { TAppConfig } from '@configs/app.config';

import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './filters/global-exception.filter';
import { CLogger } from './logger/custom-logger';
import { CValidationPipe } from './pipes/validation.pipe';

dotenv.config({
  path:
    process.env.NODE_ENV === 'production'
      ? '.env.production'
      : '.env.development',
});

async function bootstrap() {
  const options: NestApplicationOptions = {
    cors: true,
    logger: CLogger,
  };

  // Enable TLS
  if (process.env.ENABLE_TLS === 'true') {
    options.httpsOptions = {
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
    };
  }
  // End Enable TLS

  const app = await NestFactory.create(AppModule, options);

  // Get app configs
  const configService = app.get(ConfigService);
  const port = process.env.PORT || 3000;

  // Global setup
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionsFilter());
  app.useGlobalPipes(new CValidationPipe());
  // End Global setup

  // Swagger setup
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('AMTBVN EDU Backend')
      .setDescription('Api documents for AMTBVN EDU')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  // End Swagger setup

  await app.startAllMicroservices();
  CLogger.log('Microservices are running', 'Bootstrap');

  await app.listen(port, '0.0.0.0', () => {
    CLogger.log(`Server is running on port ${port}`, 'Bootstrap');
  });
}

bootstrap();
