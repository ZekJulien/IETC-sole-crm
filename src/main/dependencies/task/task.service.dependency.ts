import { TaskService } from '../../services/task/task.service'
import { getTaskRepository } from './task.repository.dependency'

let _instance: TaskService | null = null

export function getTaskService(): TaskService {
  if (!_instance) _instance = new TaskService(getTaskRepository())
  return _instance
}
