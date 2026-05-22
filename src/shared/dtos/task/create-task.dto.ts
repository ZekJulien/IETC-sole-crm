import { z } from 'zod'
import { TaskStatus } from './task-status.enum'
import { TaskPriority } from './task-priority.enum'

export const CreateTaskSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  status:      z.enum(TaskStatus).optional(),
  priority:    z.enum(TaskPriority).optional(),
  dueDate:     z.coerce.date().optional(),
  projectId:   z.number().int().positive(),
})

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>
