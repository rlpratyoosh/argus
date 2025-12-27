import validateOrThrow from 'src/common/helper/zod-validation.helper';
import z from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_AUTH_SECRET: z
    .string()
    .min(32, 'Auth Secret should be at least of 32 characters')
    .max(128),
  JWT_EXPIRATION_TIME: z.string().default('900'),
  JWT_REFRESH_EXPIRATION_TIME: z.string().default('604800'),
  VERIFICATION_SECRET: z
    .string()
    .min(32, 'Auth Secret should be at least of 32 characters')
    .max(128),
  VERIFICATION_EXPIRATION_TIME: z.string().default('900'),
  JWT_ISSUER: z.string().url().default('http://localhost:8000'),
  JWT_AUDIENCE: z.string().url().default('http://localhost:3000'),
  MAIL_HOST: z.string(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
});

export default function envValidation(env: Record<string, string | undefined>) {
  const data = validateOrThrow(envSchema, env);
  return data;
}
