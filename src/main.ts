import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port = Number(configService.get('PORT', 4000));

  await app.listen(port);

  logger.log(`Application running on: ${await app.getUrl()}`);
}

void bootstrap();
