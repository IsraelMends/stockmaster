import { z } from 'zod'

export const createCategorySchema = z.object({
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(100, 'Limite atingido'),
    description: z.string()
        .max(500, 'Description much longer')
        .optional()
})