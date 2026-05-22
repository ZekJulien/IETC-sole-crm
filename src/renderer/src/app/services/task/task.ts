import { Injectable } from '@angular/core'
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatusCount } from '@shared/dtos/task'

@Injectable({ providedIn: 'root' })
export class TaskService {
  async getByProject(projectId: number): Promise<TaskDto[]> {
    const res = await window.api.task.getByProject(projectId)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async countByStatus(projectId: number): Promise<TaskStatusCount> {
    const res = await window.api.task.countByStatus(projectId)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async add(data: CreateTaskDto): Promise<TaskDto> {
    const res = await window.api.task.add(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async update(data: UpdateTaskDto): Promise<TaskDto> {
    const res = await window.api.task.update(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async toggleStatus(id: number): Promise<TaskDto> {
    const res = await window.api.task.toggleStatus(id)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.task.remove(id)
    if (res.error) throw new Error(res.error.message)
  }
}
