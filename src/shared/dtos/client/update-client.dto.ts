import { z } from 'zod'
import { ClientType } from './client-type.enum'

export const UpdateClientSchema = z.object({
  id:            z.number().int().positive(),
  name:          z.string().min(1).optional(),
  firstName:     z.string().nullable().optional(),
  email:         z.email().nullable().optional(),
  phone:         z.string().nullable().optional(),
  street:        z.string().nullable().optional(),
  zipCode:       z.string().nullable().optional(),
  city:          z.string().nullable().optional(),
  country:       z.string().nullable().optional(),
  type:          z.enum(ClientType).optional(),
  companyNumber: z.string().nullable().optional(),
  vatNumber:     z.string().nullable().optional(),
  peppolId:      z.string().nullable().optional(),
  notes:         z.string().nullable().optional(),
  archived:      z.boolean().optional(),
})

export type UpdateClientDto = z.infer<typeof UpdateClientSchema>
