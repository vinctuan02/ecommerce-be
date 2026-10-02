import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseConfigService } from './modules/common/config/database.config';
import { envValidationSchema } from './modules/common/config/env.validation.schema';
import { BucketModule } from './modules/bucket/bucket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({ useClass: DatabaseConfigService }),
    BucketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
