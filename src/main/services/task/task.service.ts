import { Task } from '@db/client'
import { TaskRepository } from '../../repositories/task/task.repository'
import { BaseService } from '../base.service'
import { AppError } from '../../errors/app-error'
import { TaskDto, CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority, TaskStatusCount } from '@shared/dtos/task'

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  [TaskStatus.TODO]:        TaskStatus.IN_PROGRESS,
  [TaskStatus.IN_PROGRESS]: TaskStatus.DONE,
  [TaskStatus.DONE]:        TaskStatus.TODO,
  [TaskStatus.BLOCKED]:     TaskStatus.TODO,
}

export class TaskService extends BaseService<Task, TaskDto> {
  constructor(private readonly repo: TaskRepository) { super() }

  async getByProject(projectId: number): Promise<TaskDto[]> {
    const tasks = await this.repo.findByProjectId(projectId)
    return tasks.map(t => this.toDto(t))
  }

  async countByStatus(projectId: number): Promise<TaskStatusCount> {
    const counts = await this.repo.countByStatus(projectId)
    return {
      [TaskStatus.TODO]:        counts[TaskStatus.TODO]        ?? 0,
      [TaskStatus.IN_PROGRESS]: counts[TaskStatus.IN_PROGRESS] ?? 0,
      [TaskStatus.DONE]:        counts[TaskStatus.DONE]        ?? 0,
      [TaskStatus.BLOCKED]:     counts[TaskStatus.BLOCKED]     ?? 0,
    }
  }

  async add(data: CreateTaskDto): Promise<TaskDto> {
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateTaskDto): Promise<TaskDto> {
    return this.toDto(await this.repo.update(data))
  }

  async toggleStatus(id: number): Promise<TaskDto> {
    const task = await this.repo.findById(id)
    if (!task) throw new AppError('NOT_FOUND')
    const next = STATUS_CYCLE[task.status as TaskStatus] ?? TaskStatus.TODO
    return this.toDto(await this.repo.update({ id, status: next }))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(t: Task): TaskDto {
    return {
      id:          t.id,
      title:       t.title,
      description: t.description,
      status:      t.status as TaskStatus,
      priority:    t.priority as TaskPriority,
      dueDate:     t.dueDate,
      createdAt:   t.createdAt,
      projectId:   t.projectId,
    }
  }
}
