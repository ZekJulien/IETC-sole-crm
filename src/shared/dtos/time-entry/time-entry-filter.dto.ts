import { z } from 'zod'

export const TimeEntryFilterSchema = z.object({
  projectId: z.number().int().positive().optional(),
  from:      z.coerce.date().optional(),
  to:        z.coerce.date().optional(),
}).optional()

export type TimeEntryFilter = z.infer<typeof TimeEntryFilterSchema>
