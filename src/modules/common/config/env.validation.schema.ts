import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  //DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  DB_RETRY_CONNECT: Joi.number().default(3),

  //Swagger
  SWAGGER_ROUTE: Joi.string().default('api-docs'),
  SWAGGER_USER: Joi.string().default('1'),
  SWAGGER_PASSWORD: Joi.string().default('1'),

  // MinIO Storage (MinioService dùng getOrThrow khi BucketModule được load)
  MINIO_ENDPOINT: Joi.string().uri().optional(),
  MINIO_REGION: Joi.string().default('us-east-1'),
  MINIO_ACCESS_KEY: Joi.string().optional(),
  MINIO_SECRET_KEY: Joi.string().optional(),
  MINIO_BUCKET: Joi.string().optional(),

  // Domains — CSV list, separator `,`. Empty là hợp lệ (fallback trong domain.config).
  CORS_ORIGINS: Joi.string().allow('').default(''),
  PRIMARY_DOMAINS: Joi.string().allow('').default(''),
});
