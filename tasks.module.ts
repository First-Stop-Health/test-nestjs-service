import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstraps and starts the NestJS application.
 *
 * Applies a global ValidationPipe configured to strip unknown properties (`whitelist: true`),
 * reject requests with unknown properties (`forbidNonWhitelisted: true`), and transform payloads
 * to DTO instances (`transform: true`). Chooses the listening port from the `PORT` environment
 * variable or defaults to `3000`, starts the HTTP server, and logs the running URL.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();