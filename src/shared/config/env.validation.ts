import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development')
    .description('Application environment'),

  APP_PORT: Joi.number().port().default(3000).description('Application port'),

  // Database Configuration
  DB_TYPE: Joi.string()
    .valid('postgres', 'mysql', 'mariadb', 'sqlite', 'mssql', 'oracle')
    .default('postgres')
    .description('Database type'),

  POSTGRES_HOST: Joi.string().required().description('PostgreSQL host address'),

  POSTGRES_PORT: Joi.number()
    .port()
    .default(5432)
    .description('PostgreSQL port'),

  POSTGRES_USER: Joi.string()
    .required()
    .min(3)
    .max(50)
    .description('PostgreSQL username'),

  POSTGRES_PASSWORD: Joi.string()
    .required()
    .min(8)
    .description('PostgreSQL password (min 8 characters)'),

  POSTGRES_DB: Joi.string()
    .required()
    .min(1)
    .description('PostgreSQL database name'),

  DB_SYNC: Joi.boolean()
    .default(false)
    .description('TypeORM synchronize option (should be false in production)'),

  AUTO_LOAD_ENTITIES: Joi.boolean()
    .default(true)
    .description('TypeORM auto load entities'),

  DB_ENTITY_PREFIX: Joi.string()
    .optional()
    .default('nestjs_app_')
    .description('Database entity prefix'),

  DB_LOGGER: Joi.string()
    .valid('advanced-console', 'simple-console', 'file', 'debug')
    .default('advanced-console')
    .description('TypeORM logger type'),

  DB_LOGGING: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid('all'),
      Joi.array().items(
        Joi.string().valid('query', 'error', 'schema', 'warn', 'info', 'log'),
      ),
    )
    .default('all')
    .description('TypeORM logging options'),

  // JWT Configuration
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .description('JWT secret key (min 32 characters for security)'),

  JWT_EXPIRES_IN: Joi.string()
    .default('1h')
    .description('JWT token expiration time'),

  // PgAdmin Configuration (optional for development)
  PGADMIN_HOST: Joi.string().optional().description('PgAdmin host'),

  PGADMIN_PORT: Joi.number().port().optional().description('PgAdmin port'),

  PGADMIN_EMAIL: Joi.string().email().optional().description('PgAdmin email'),

  PGADMIN_PASSWORD: Joi.string()
    .optional()
    .min(8)
    .description('PgAdmin password'),

  POSTGRES_CONTAINER_NAME: Joi.string()
    .optional()
    .description('PostgreSQL container name'),
});

export default envValidationSchema;
