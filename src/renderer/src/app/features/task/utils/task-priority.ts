import { TaskPriority } from '@shared/dtos/task'

export const TASK_PRIORITIES: TaskPriority[] = [
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
]

export function taskPriorityKey(priority: TaskPriority | string): string {
  return 'task.priority.' + String(priority).toLowerCase()
}
