import { TaskPriority } from '@shared/dtos/task'
import { statusKey } from '@app/utils'

export const TASK_PRIORITIES: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
]

export function taskPriorityKey(priority: TaskPriority | string): string {
  return statusKey('task.priority.', priority)
}
