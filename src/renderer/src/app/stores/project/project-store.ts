import { Injectable, computed, inject, signal } from '@angular/core'
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@shared/dtos/project'
import { FindManyArgs } from '@shared/types'
import { ProjectService } from '@app/services/project/project'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class ProjectStore {
  private readonly projectSvc = inject(ProjectService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _projects = signal<ProjectDto[]>([])
  private readonly _loading  = signal<boolean>(false)
  private readonly _saving   = signal<boolean>(false)

  readonly projects = this._projects.asReadonly()
  readonly loading  = this._loading.asReadonly()
  readonly saving   = this._saving.asReadonly()
  readonly isEmpty  = computed(() => this._projects().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      await this.projectSvc.load(args)
      this._projects.set(this.projectSvc.projects())
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async getById(id: number): Promise<ProjectDto | null> {
    try {
      return await this.projectSvc.getById(id)
    } catch (e) { this.errors.handle(e); return null }
  }

  async add(data: CreateProjectDto): Promise<ProjectDto | null> {
    this._saving.set(true)
    try {
      const created = await this.projectSvc.add(data)
      this._projects.update(list => [created, ...list])
      this.toast.success(this.i18n.t('project.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateProjectDto): Promise<ProjectDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.projectSvc.update(data)
      this._projects.update(list => list.map(p => p.id === data.id ? updated : p))
      this.toast.success(this.i18n.t('project.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.projectSvc.remove(id)
      this._projects.update(list => list.filter(p => p.id !== id))
      this.toast.success(this.i18n.t('project.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }
}
