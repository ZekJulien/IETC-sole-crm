import { z } from 'zod'

export const UpdateContactSchema = z.object({
  id:        z.number().int().positive(),
  lastName:  z.string().min(1).optional(),
  firstName: z.string().nullable().optional(),
  email:     z.email().nullable().optional(),
  phone:     z.string().nullable().optional(),
  role:      z.string().nullable().optional(),
})

export type UpdateContactDto = z.infer<typeof UpdateContactSchema>
