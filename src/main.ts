import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { globalValidationPipe } from './modules/common/config/validation.config';
import { setupSwagger } from './modules/common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(globalValidationPipe);

  setupSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
