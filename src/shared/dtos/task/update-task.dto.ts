import { z } from 'zod'
import { TaskStatus } from './task-status.enum'
import { TaskPriority } from './task-priority.enum'

export const UpdateTaskSchema = z.object({
  id:          z.number().int().positive(),
  title:       z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status:      z.enum(TaskStatus).optional(),
  priority:    z.enum(TaskPriority).optional(),
  dueDate:     z.coerce.date().nullable().optional(),
})

export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>
