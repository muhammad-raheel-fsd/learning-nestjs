export const appEnv = () => ({
  environment: process.env.NODE_ENV || 'development',
  database: {
    type: (process.env.DB_TYPE as 'postgres') || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'nestjs_app_user',
    password: process.env.POSTGRES_PASSWORD || 'nestjs_app_password',
    database: process.env.POSTGRES_DB || 'nestjs_app_db',
    synchronize: process.env.DB_SYNC === 'true' || false,
    autoLoadEntities: process.env.AUTO_LOAD_ENTITIES === 'true' || false,
    entityPrefix: process.env.DB_ENTITY_PREFIX || 'nestjs_app_',
    logger: process.env.DB_LOGGER || 'advanced-console',
    logging: process.env.DB_LOGGING || 'all',
  },
});
