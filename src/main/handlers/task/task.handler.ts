import { TASK_CHANNELS } from '@shared/channels/task'
import { CreateTaskSchema, UpdateTaskSchema } from '@shared/dtos/task'
import { IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { TaskService } from '../../services/task/task.service'

export function registerTaskHandlers(service: TaskService): void {
  ipcHandle(TASK_CHANNELS.GET_BY_PROJECT,  IdSchema,         (id)   => service.getByProject(id))
  ipcHandle(TASK_CHANNELS.COUNT_BY_STATUS, IdSchema,         (id)   => service.countByStatus(id))
  ipcHandle(TASK_CHANNELS.ADD,             CreateTaskSchema, (data) => service.add(data))
  ipcHandle(TASK_CHANNELS.UPDATE,          UpdateTaskSchema, (data) => service.update(data))
  ipcHandle(TASK_CHANNELS.TOGGLE_STATUS,   IdSchema,         (id)   => service.toggleStatus(id))
  ipcHandle(TASK_CHANNELS.REMOVE,          IdSchema,         (id)   => service.remove(id))
}
