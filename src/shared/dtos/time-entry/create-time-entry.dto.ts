import { z } from 'zod'

export const CreateTimeEntrySchema = z.object({
  duration:    z.number().int().positive(),
  date:        z.coerce.date().optional(),
  description: z.string().optional(),
  billable:    z.boolean().optional(),
  pomodoro:    z.boolean().optional(),
  taskId:      z.number().int().positive().nullable().optional(),
  projectId:   z.number().int().positive(),
})

export type CreateTimeEntryDto = z.infer<typeof CreateTimeEntrySchema>
