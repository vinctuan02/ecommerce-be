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

  // Auth
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.number().default(15 * 60), // giây
  REFRESH_TOKEN_TTL_DAYS: Joi.number().default(30),
  COOKIE_SECURE: Joi.boolean().default(false),
  FE_URL: Joi.string().uri().default('http://localhost:3000'), // ghép link trong email

  // Tài khoản admin: lúc khởi động chưa có thì tạo (cần ADMIN_PASSWORD), có rồi thì gán role ADMIN
  ADMIN_EMAIL: Joi.string()
    .email({ tlds: { allow: false } })
    .optional(),
  ADMIN_PASSWORD: Joi.string().min(8).max(72).optional(),

  // Domains — CSV list, separator `,`. Empty là hợp lệ (fallback trong domain.config).
  CORS_ORIGINS: Joi.string().allow('').default(''),
  PRIMARY_DOMAINS: Joi.string().allow('').default(''),
});
