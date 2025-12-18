import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z
    .number()
    .int("Product ID must be an integer")
    .positive("Product ID must be positive"),
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"]),
  reason: z.enum(["PURCHASE", "SALE", "LOSS", "RETURN", "ADJUSTMENT"]),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),
  notes: z.string().optional(),
});
