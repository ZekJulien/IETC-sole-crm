import { z } from 'zod'

export const PdfLabelsSchema = z.object({
  title:              z.string(),
  number:             z.string(),
  issueDate:          z.string(),
  supplyDate:         z.string(),
  dueDate:            z.string(),
  validUntil:         z.string(),
  quoteRef:           z.string(),
  billedTo:           z.string(),
  colDescription:     z.string(),
  colQty:             z.string(),
  colUnitPrice:       z.string(),
  colDiscount:        z.string(),
  colVat:             z.string(),
  colLineTotal:       z.string(),
  totalHt:            z.string(),
  vat:                z.string(),
  totalVat:           z.string(),
  totalTtc:           z.string(),
  paid:               z.string(),
  balanceDue:         z.string(),
  companyNumber:      z.string(),
  vatNumber:          z.string(),
  iban:               z.string(),
  bic:                z.string(),
  paymentConditions:  z.string(),
  mentionFranchise:   z.string(),
  mentionReverseCharge: z.string(),
})

export const ExportPdfSchema = z.object({
  id:     z.number().int().positive(),
  locale: z.string().min(2),
  labels: PdfLabelsSchema,
})

export type PdfLabels = z.infer<typeof PdfLabelsSchema>
export type ExportPdfDto = z.infer<typeof ExportPdfSchema>
