import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
  .setTitle('Inklusive task')
  .setDescription('The API documentation for Inklusive task')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT');
  await app.listen(port || 3002);
}
bootstrap();
