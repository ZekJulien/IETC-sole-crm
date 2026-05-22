import { z } from 'zod'
import { HexColorSchema } from '../../validators'

export const UpdateCategorySchema = z.object({
  id:    z.number().int().positive(),
  name:  z.string().min(1).optional(),
  color: HexColorSchema.optional(),
})

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>
