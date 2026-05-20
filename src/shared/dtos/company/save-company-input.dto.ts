import { z } from 'zod'
import { SaveCompanySchema } from './save-company.dto'
import { SaveCompanySettingsSchema } from './save-company-settings.dto'

export const SaveCompanyInputSchema = z.object({
  company:  SaveCompanySchema,
  settings: SaveCompanySettingsSchema.optional(),
})

export type SaveCompanyInput = z.infer<typeof SaveCompanyInputSchema>

export const CounterValueSchema = z.number().int().nonnegative()
