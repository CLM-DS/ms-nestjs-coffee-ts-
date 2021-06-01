import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // 👈 force to transform data to our type
      forbidNonWhitelisted: true, // validate the contract vs entity
      transformOptions: {
        enableImplicitConversion: true, // transform in run time limit and offset dto usage
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
