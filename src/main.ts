import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // validate the contract vs entity
      // transform: true, // 👈 force to transform data to our type
    }),
  );
  await app.listen(3000);
}
bootstrap();
