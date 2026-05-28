import { Injectable, signal } from '@angular/core'
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@shared/dtos/project'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly _projects = signal<ProjectDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly projects = this._projects.asReadonly()
  readonly loading   = this._loading.asReadonly()

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      const result = unwrap(await window.api.project.get(args))
      this._projects.set(result.data)
    } finally {
      this._loading.set(false)
    }
  }

  async getById(id: number): Promise<ProjectDto | null> {
    return unwrap(await window.api.project.getById(id))
  }

  async add(data: CreateProjectDto): Promise<ProjectDto> {
    return unwrap(await window.api.project.add(data))
  }

  async update(data: UpdateProjectDto): Promise<ProjectDto> {
    return unwrap(await window.api.project.update(data))
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.project.remove(id))
  }
}
