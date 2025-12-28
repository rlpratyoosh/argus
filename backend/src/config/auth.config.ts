import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.JWT_AUTH_SECRET || 'auth-secret',
  expiresIn: parseInt(process.env.JWT_EXPIRATION_TIME ?? '900', 10),
  refreshExpiresIn: parseInt(
    process.env.JWT_REFRESH_EXPIRATION_TIME ?? '604800',
    10,
  ),
  issuer: process.env.JWT_ISSUER || 'http://localhost:8000',
  audience: process.env.JWT_AUDIENCE || 'http://localhost:3000',
}));
