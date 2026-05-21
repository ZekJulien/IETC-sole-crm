import { z } from 'zod'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export const UpdateCategorySchema = z.object({
  id:    z.number().int().positive(),
  name:  z.string().min(1).optional(),
  color: z.string().regex(HEX_COLOR).optional(),
})

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>
