import { z } from 'zod'

export const createProductsSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(200, 'Limit reached'),
    barcode: z.string()
        .max(13, 'Limit reached')
        .optional(),
    description: z.string()
        .max(500, 'Description is too long.')
        .optional(),
    costPrice: z.number()
        .positive('Cost price must be positive'),
    salePrice: z.number()
        .positive('Sale price must be positive'),
    currentStock: z.number()
        .nonnegative('Stock cannot be negative'),
    minimumStock: z.number()
        .nonnegative('Minimum stock cannot be negative')
        .optional(),
    unit: z.enum(['UN', 'KG', 'LT', 'PCT', 'CX']),
    categoryId: z.number()
        .int()
        .positive(),
    supplierId: z.number()
        .int()
        .positive(),
    active: z.boolean()
        .optional()
})

export const updateProductsSchema = createProductsSchema.partial()