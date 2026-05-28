import { Injectable } from '@angular/core'
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatusCount } from '@shared/dtos/task'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class TaskService {
  async getByProject(projectId: number): Promise<TaskDto[]> {
    return unwrap(await window.api.task.getByProject(projectId))
  }

  async countByStatus(projectId: number): Promise<TaskStatusCount> {
    return unwrap(await window.api.task.countByStatus(projectId))
  }

  async add(data: CreateTaskDto): Promise<TaskDto> {
    return unwrap(await window.api.task.add(data))
  }

  async update(data: UpdateTaskDto): Promise<TaskDto> {
    return unwrap(await window.api.task.update(data))
  }

  async toggleStatus(id: number): Promise<TaskDto> {
    return unwrap(await window.api.task.toggleStatus(id))
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.task.remove(id))
  }
}
