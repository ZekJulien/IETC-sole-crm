import { z } from 'zod'

export const CreateContactSchema = z.object({
  clientId:  z.number().int().positive(),
  lastName:  z.string().min(1),
  firstName: z.string().optional(),
  email:     z.email().optional(),
  phone:     z.string().optional(),
  role:      z.string().optional(),
})

export type CreateContactDto = z.infer<typeof CreateContactSchema>
