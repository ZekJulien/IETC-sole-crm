import { z } from 'zod'
import { ProjectStatus } from './project-status.enum'

export const CreateProjectSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
  status:      z.enum(ProjectStatus).optional(),
  startDate:   z.coerce.date().optional(),
  endDate:     z.coerce.date().optional(),
  hourlyRate:  z.number().nonnegative().optional(),
  dailyRate:   z.number().nonnegative().optional(),
  budget:      z.number().nonnegative().optional(),
  clientId:    z.number().int().positive(),
  categoryIds: z.array(z.number().int().positive()).optional(),
})

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>
