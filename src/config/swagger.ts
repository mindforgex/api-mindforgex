import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Document API')
  .setDescription('The API description')
  .setVersion('1.0')
  .addBearerAuth({ type: 'http' }, 'jwt')
  .build();
