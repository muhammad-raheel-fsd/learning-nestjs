import { registerAs } from '@nestjs/config';

export default registerAs('authConfig', () => ({
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
}));
