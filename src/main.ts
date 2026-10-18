import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT', 4000));

  app.setGlobalPrefix('/api/v1');

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // @manager swagger
  const managerConfig = new DocumentBuilder()
    .setTitle('HR API - manager routs')
    .setDescription(
      'این روت ها مربوط به نقش کاربری مدیر هست و در پنل manager مورد استفاده قرار خواهد گرفت',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const managerDocument = SwaggerModule.createDocument(app, managerConfig, {
    include: [AppModule],
    deepScanRoutes: true,
  });
  if (managerDocument.paths) {
    Object.keys(managerDocument.paths).forEach((path) => {
      if (!path.includes('/manager') && !path.includes('/auth')) {
        delete managerDocument.paths[path];
      }
    });
  }
  SwaggerModule.setup('api/v1/manager/docs', app, managerDocument);

  // @employee swagger
  const employeeConfig = new DocumentBuilder()
    .setTitle('HR API - employee routs')
    .setDescription(
      'این روت ها مربوط به نقش کاربری کارمند هست و در پنل employee مورد استفاده قرار خواهد گرفت',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const employeeDocument = SwaggerModule.createDocument(app, employeeConfig, {
    include: [AppModule],
    deepScanRoutes: true,
  });
  if (employeeDocument.paths) {
    Object.keys(employeeDocument.paths).forEach((path) => {
      if (!path.includes('/employee') && !path.includes('/auth')) {
        delete employeeDocument.paths[path];
      }
    });
  }
  SwaggerModule.setup('api/v1/employee/docs', app, employeeDocument);

  await app.listen(port);
  logger.log(`Application running on: ${await app.getUrl()}`);
}

void bootstrap();
