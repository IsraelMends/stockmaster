import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Limit reached"),
  cnpj: z
    .string()
    .length(14, "CNPJ has to have 14 digits")
    .regex(/^\d{14}$/, "CNPJ has to have only numbers"),
  email: z.string().email("Email invalid").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();
