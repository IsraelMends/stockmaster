import { z } from 'zod'

export const createUserSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Limit reached'),
    email: z.string()
        .email('Invalid email format'),
    password: z.string()
        .min(6, 'Password must have at least 6 characters'),
    role: z.enum(['ADMIN', 'OPERATOR'])
        .optional()
        .default('OPERATOR'),
    active: z.boolean()
        .optional()
})

export const updateUserSchema = createUserSchema.partial()