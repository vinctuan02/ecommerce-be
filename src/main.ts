import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './modules/common/interceptors/response.interceptor';
import { globalValidationPipe } from './modules/common/config/validation.config';
import { setupSwagger } from './modules/common/config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalInterceptors(new ResponseInterceptor());

  setupSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
