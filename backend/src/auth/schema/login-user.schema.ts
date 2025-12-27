import z from 'zod';

export const LoginUserSchema = z.object({
  username: z
    .string()
    .min(4, 'Username should have at least 4 charracters')
    .max(32, "Username shouldn't have more than 32 characters"),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      'Password must contain at least one special character',
    ),
});
