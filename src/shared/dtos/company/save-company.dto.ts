import { z } from 'zod'

export const SaveCompanySchema = z.object({
  name:          z.string().min(1),
  legalForm:     z.string().nullable().optional(),
  street:        z.string().nullable().optional(),
  zipCode:       z.string().nullable().optional(),
  city:          z.string().nullable().optional(),
  country:       z.string().nullable().optional(),
  email:         z.email().nullable().optional(),
  phone:         z.string().nullable().optional(),
  website:       z.string().nullable().optional(),
  companyNumber: z.string().nullable().optional(),
  vatNumber:     z.string().nullable().optional(),
  peppolId:      z.string().nullable().optional(),
  iban:          z.string().nullable().optional(),
  bic:           z.string().nullable().optional(),
  logoPath:      z.string().nullable().optional(),
})

export type SaveCompanyDto = z.infer<typeof SaveCompanySchema>
