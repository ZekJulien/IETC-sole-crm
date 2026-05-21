import { Injectable, computed, inject, signal } from '@angular/core'
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@shared/dtos/category'
import { FindManyArgs } from '@shared/types'
import { CategoryService } from '@app/services/category/category'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private readonly categorySvc = inject(CategoryService)
  private readonly toast       = inject(ToastService)
  private readonly errors      = inject(ErrorService)
  private readonly i18n        = inject(I18nService)

  private readonly _categories = signal<CategoryDto[]>([])
  private readonly _loading    = signal<boolean>(false)
  private readonly _saving     = signal<boolean>(false)

  readonly categories = this._categories.asReadonly()
  readonly loading    = this._loading.asReadonly()
  readonly saving     = this._saving.asReadonly()
  readonly isEmpty    = computed(() => this._categories().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    try {
      await this.categorySvc.load(args)
      this._categories.set(this.categorySvc.categories())
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async add(data: CreateCategoryDto): Promise<CategoryDto | null> {
    this._saving.set(true)
    try {
      const created = await this.categorySvc.add(data)
      this._categories.update(list => [...list, created])
      this.toast.success(this.i18n.t('category.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateCategoryDto): Promise<CategoryDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.categorySvc.update(data)
      this._categories.update(list => list.map(c => c.id === data.id ? updated : c))
      this.toast.success(this.i18n.t('category.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.categorySvc.remove(id)
      this._categories.update(list => list.filter(c => c.id !== id))
      this.toast.success(this.i18n.t('category.toast.deleted'))
    } catch (e) { this.errors.handle(e) }
  }
}
