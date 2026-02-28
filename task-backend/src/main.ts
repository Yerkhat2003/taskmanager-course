import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API для работы с досками, задачами и пользователями')
    .setVersion('1.0')
    .addTag('Boards', 'Эндпоинты для работы с досками')
    .addTag('Tasks', 'Эндпоинты для работы с задачами')
    .addTag('Users', 'Эндпоинты для работы с пользователями')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  console.log(`Пошла Апишка слушаем ${port}`);
  console.log(`Swagger UI: http://localhost:${port}/api`);
}
bootstrap();
