import { registerAs } from '@nestjs/config';

export default registerAs('appConfig', () => ({
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_PORT: parseInt(process.env.APP_PORT || '3000', 10),
}));
