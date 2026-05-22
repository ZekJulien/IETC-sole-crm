import { z } from 'zod'
import { HexColorSchema } from '../../validators'

export const CreateCategorySchema = z.object({
  name:  z.string().min(1),
  color: HexColorSchema,
})

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>
