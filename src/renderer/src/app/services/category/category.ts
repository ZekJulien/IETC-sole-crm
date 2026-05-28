import { Injectable, signal, computed } from '@angular/core'
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@shared/dtos/category'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<CategoryDto[]>([])
  private readonly _loading    = signal<boolean>(false)

  readonly categories = this._categories.asReadonly()
  readonly loading    = this._loading.asReadonly()
  readonly hasItems   = computed(() => this._categories().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const result = unwrap(await window.api.category.get(args))
    this._categories.set(result.data)
    this._loading.set(false)
  }

  async add(data: CreateCategoryDto): Promise<CategoryDto> {
    const created = unwrap(await window.api.category.add(data))
    this._categories.update(list => [...list, created])
    return created
  }

  async update(data: UpdateCategoryDto): Promise<CategoryDto> {
    const updated = unwrap(await window.api.category.update(data))
    this._categories.update(list => list.map(c => c.id === data.id ? updated : c))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.category.remove(id))
    this._categories.update(list => list.filter(c => c.id !== id))
  }
}
