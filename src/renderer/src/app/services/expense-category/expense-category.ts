import { Injectable, signal, computed } from '@angular/core'
import { ExpenseCategoryDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@shared/dtos/expense-category'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private readonly _categories = signal<ExpenseCategoryDto[]>([])
  private readonly _loading    = signal<boolean>(false)

  readonly categories = this._categories.asReadonly()
  readonly loading    = this._loading.asReadonly()
  readonly hasItems   = computed(() => this._categories().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const result = unwrap(await window.api.expenseCategory.get(args))
    this._categories.set(result.data)
    this._loading.set(false)
  }

  async add(data: CreateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    const created = unwrap(await window.api.expenseCategory.add(data))
    this._categories.update(list => [...list, created])
    return created
  }

  async update(data: UpdateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    const updated = unwrap(await window.api.expenseCategory.update(data))
    this._categories.update(list => list.map(c => c.id === data.id ? updated : c))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.expenseCategory.remove(id))
    this._categories.update(list => list.filter(c => c.id !== id))
  }
}
