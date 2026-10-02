import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get(ConfigService);

  const SWAGGER_ROUTE = configService.get<string>('SWAGGER_ROUTE', 'api-docs');

  const username = configService.get<string>('SWAGGER_USER') as string;
  const password = configService.get<string>('SWAGGER_PASSWORD') as string;

  app.use(
    [`/${SWAGGER_ROUTE}`],
    basicAuth({
      users: { [username]: password },
      challenge: true,
      unauthorizedResponse: 'Unauthorized - Bạn không có quyền truy cập',
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Ecommerce API')
    .setDescription('API documentation for Ecommerce Server')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'token',
    )
    .addSecurityRequirements('token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_ROUTE, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
};
