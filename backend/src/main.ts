import { NestFactory } from '@nestjs/core';
import { I18nValidationPipe } from 'nestjs-i18n';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局验证管道（使用i18n）
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Base Boilerplate API')
    .setDescription('B端底座系统 API 文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 服务器运行在 http://localhost:${port}/api`);
  console.log(`📘 API 文档: http://localhost:${port}/api/docs`);
  console.log(`🧩 OpenAPI JSON: http://localhost:${port}/api/docs-json`);
}
bootstrap();
