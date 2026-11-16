import { z } from 'zod';

// Validates req.params — `id` arrives as a string, so coerce it to a number.
export const userIdSchema = z.object({
  id: z.coerce
    .number({ error: 'User id must be a number' })
    .int('User id must be an integer')
    .positive('User id must be a positive number'),
});

// Validates req.body for PUT /api/users/:id.
// Strict: unknown fields (e.g. `password`, `id`, `created_at`) are rejected
// rather than silently ignored. Password changes deserve their own flow.
export const updateUserSchema = z
  .strictObject({
    name: z.string().trim().min(2).max(255),
    email: z.email().max(255).toLowerCase().trim(),
    role: z.enum(['user', 'admin']),
  })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'At least one field (name, email, role) must be provided',
  });
