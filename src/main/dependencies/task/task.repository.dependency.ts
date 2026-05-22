import { getDbContext } from '../../core'
import { TaskRepository } from '../../repositories/task/task.repository'

let _instance: TaskRepository | null = null

export function getTaskRepository(): TaskRepository {
  if (!_instance) _instance = new TaskRepository(getDbContext())
  return _instance
}
