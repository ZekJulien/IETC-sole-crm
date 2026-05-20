import { z } from 'zod'

const NumberFormatSchema = z
  .string()
  .min(1)
  .regex(/\{#+\}/, 'Le format doit contenir un compteur (ex: {####})')

export const SaveCompanySettingsSchema = z.object({
  defaultVatRate:            z.number().min(0).max(100).optional(),
  paymentTermsDays:          z.number().int().nonnegative().optional(),
  paymentConditions:         z.string().nullable().optional(),
  invoiceNumberFormat:       NumberFormatSchema.optional(),
  invoiceCounterResetYearly: z.boolean().optional(),
  quoteNumberFormat:         NumberFormatSchema.optional(),
  quoteCounterResetYearly:   z.boolean().optional(),
})

export type SaveCompanySettingsDto = z.infer<typeof SaveCompanySettingsSchema>
