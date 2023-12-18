import { Logger, ValidationPipe } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common/enums/request-method.enum';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as mongoose from 'mongoose';

import { swaggerConfig } from 'src/config/swagger';

import { MongoExceptionFilter } from 'src/filters/mongo-exception.filter';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('main.bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.getHttpAdapter().getInstance().disable('x-powered-by');
  const options =
    process.env.NODE_ENV === 'development'
      ? {}
      : { origin: process.env.CORS_ORIGIN.split(',') };
  app.enableCors(options);
  app.use(helmet({}));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('v1', {
    exclude: [
      {
        path: 'nfts/metadata/contracts/:contractAddress/:tokenId',
        method: RequestMethod.GET,
      },
    ],
  });

  app.useGlobalFilters(new MongoExceptionFilter());
  process.on('uncaughtException', (error: Error) => {
    logger.log(`App crashed with error: ${error.message}`, error.stack);
  });

  if (process.env.NODE_ENV !== 'production')
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
    );

  if (process.env.NODE_ENV === 'development') mongoose.set('debug', true);

  await app.listen(Number(process.env.PORT) || 3000);

  logger.log(
    `Application is running on: ${await app.getUrl()}, processId : ${
      process.pid
    }`,
  );
}
bootstrap();
