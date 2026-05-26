import { z } from 'zod'

export const CreateProductSchema = z.object({
  name:        z.string().min(1),
  description: z.string().nullable().optional(),
  unitPrice:   z.number().nonnegative(),
  vatRate:     z.number().min(0).max(100),
  unit:        z.string().nullable().optional(),
})

export type CreateProductDto = z.infer<typeof CreateProductSchema>
