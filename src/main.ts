import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new (await import('@nestjs/common')).ValidationPipe({
      whitelist: true, // remove properties that donot exist in the DTO
      forbidNonWhitelisted: true, // throw error if non whitelisted properties are present
      transform: true, // automatically transform payloads to DTO instances
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
