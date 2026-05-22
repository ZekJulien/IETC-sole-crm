import { Injectable, signal } from '@angular/core'
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@shared/dtos/project'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly _projects = signal<ProjectDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly projects = this._projects.asReadonly()
  readonly loading   = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const res = await window.api.project.get(args)
      if (res.error) throw new Error(res.error.message)
      this._projects.set(res.data!.data)
    } finally {
      this._loading.set(false)
    }
  }

  async getById(id: number): Promise<ProjectDto | null> {
    const res = await window.api.project.getById(id)
    if (res.error) throw new Error(res.error.message)
    return res.data
  }

  async add(data: CreateProjectDto): Promise<ProjectDto> {
    const res = await window.api.project.add(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async update(data: UpdateProjectDto): Promise<ProjectDto> {
    const res = await window.api.project.update(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.project.remove(id)
    if (res.error) throw new Error(res.error.message)
  }
}
