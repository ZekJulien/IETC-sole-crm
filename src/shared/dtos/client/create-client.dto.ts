import { z } from 'zod'
import { ClientType } from './client-type.enum'

export const CreateClientSchema = z.object({
  name:          z.string().min(1),
  firstName:     z.string().optional(),
  email:         z.email().optional(),
  phone:         z.string().optional(),
  street:        z.string().optional(),
  zipCode:       z.string().optional(),
  city:          z.string().optional(),
  country:       z.string().optional(),
  type:          z.enum(ClientType).optional(),
  companyNumber: z.string().optional(),
  vatNumber:     z.string().optional(),
  peppolId:      z.string().optional(),
  notes:         z.string().optional(),
})

export type CreateClientDto = z.infer<typeof CreateClientSchema>
