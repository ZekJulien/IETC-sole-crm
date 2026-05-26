import { z } from 'zod'
import { PaymentMethod } from './payment-method.enum'

export const RecordPaymentSchema = z.object({
  invoiceId: z.number().int().positive(),
  date:      z.coerce.date().optional(),
  amount:    z.number().positive(),
  method:    z.enum(PaymentMethod),
  reference: z.string().nullable().optional(),
})

export type RecordPaymentDto = z.infer<typeof RecordPaymentSchema>
