import { z } from 'zod'

export const UpdateTimeEntrySchema = z.object({
  id:          z.number().int().positive(),
  duration:    z.number().int().positive().optional(),
  date:        z.coerce.date().optional(),
  description: z.string().nullable().optional(),
  billable:    z.boolean().optional(),
  taskId:      z.number().int().positive().nullable().optional(),
})

export type UpdateTimeEntryDto = z.infer<typeof UpdateTimeEntrySchema>
