import { z } from 'zod'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export const CreateCategorySchema = z.object({
  name:  z.string().min(1),
  color: z.string().regex(HEX_COLOR),
})

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>
