import { z } from 'zod'

export const createCategorySchema = z.object({
    name: z.string()
        .min(1, 'Name is required.')
        .max(100, 'Limit reached'),
    description: z.string()
        .max(500, 'Description is too long.')
        .optional()
})

export const updateCategorySchema = createCategorySchema.partial()