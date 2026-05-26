import { z } from 'zod'

export const CreateVatRateSchema = z.object({
  label:     z.string().min(1),
  rate:      z.number().min(0).max(100),
  isDefault: z.boolean().optional(),
})

export type CreateVatRateDto = z.infer<typeof CreateVatRateSchema>
