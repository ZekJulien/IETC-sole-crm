import { z } from 'zod'

export const UpdateProductSchema = z.object({
  id:          z.number().int().positive(),
  name:        z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  unitPrice:   z.number().nonnegative().optional(),
  vatRate:     z.number().min(0).max(100).optional(),
  unit:        z.string().nullable().optional(),
  archived:    z.boolean().optional(),
})

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>
