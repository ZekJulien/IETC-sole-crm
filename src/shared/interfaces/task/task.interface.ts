import { IpcResponse } from '../../types'
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatusCount } from '../../dtos/task'

export interface TaskAPI {
  getByProject:  (projectId: number)  => Promise<IpcResponse<TaskDto[]>>
  countByStatus: (projectId: number)  => Promise<IpcResponse<TaskStatusCount>>
  add:           (data: CreateTaskDto) => Promise<IpcResponse<TaskDto>>
  update:        (data: UpdateTaskDto) => Promise<IpcResponse<TaskDto>>
  toggleStatus:  (id: number)          => Promise<IpcResponse<TaskDto>>
  remove:        (id: number)          => Promise<IpcResponse<void>>
}
