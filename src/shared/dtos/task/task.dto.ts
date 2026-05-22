import { TaskStatus } from './task-status.enum'
import { TaskPriority } from './task-priority.enum'

export interface TaskDto {
  id:          number
  title:       string
  description: string | null
  status:      TaskStatus
  priority:    TaskPriority
  dueDate:     Date | null
  createdAt:   Date
  projectId:   number
}
