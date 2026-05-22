import { z } from 'zod'
import { ProjectStatus } from './project-status.enum'

export const UpdateProjectSchema = z.object({
  id:          z.number().int().positive(),
  name:        z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status:      z.enum(ProjectStatus).optional(),
  startDate:   z.coerce.date().nullable().optional(),
  endDate:     z.coerce.date().nullable().optional(),
  hourlyRate:  z.number().nonnegative().nullable().optional(),
  dailyRate:   z.number().nonnegative().nullable().optional(),
  budget:      z.number().nonnegative().nullable().optional(),
  clientId:    z.number().int().positive().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
})

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>
