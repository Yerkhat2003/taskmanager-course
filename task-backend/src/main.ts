import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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
  
  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  console.log(`Пошла Апишка слушаем ${port}`);
  
}
bootstrap();
