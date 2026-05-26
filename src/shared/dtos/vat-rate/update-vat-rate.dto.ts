import { z } from 'zod'

export const UpdateVatRateSchema = z.object({
  id:        z.number().int().positive(),
  label:     z.string().min(1).optional(),
  rate:      z.number().min(0).max(100).optional(),
  isDefault: z.boolean().optional(),
})

export type UpdateVatRateDto = z.infer<typeof UpdateVatRateSchema>
