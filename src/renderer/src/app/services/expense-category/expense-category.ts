import { Injectable, signal, computed } from '@angular/core'
import { ExpenseCategoryDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '@shared/dtos/expense-category'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  private readonly _categories = signal<ExpenseCategoryDto[]>([])
  private readonly _loading    = signal<boolean>(false)

  readonly categories = this._categories.asReadonly()
  readonly loading    = this._loading.asReadonly()
  readonly hasItems   = computed(() => this._categories().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const res = await window.api.expenseCategory.get(args)
    if (res.error) throw new Error(res.error.message)
    this._categories.set(res.data!.data)
    this._loading.set(false)
  }

  async add(data: CreateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    const res = await window.api.expenseCategory.add(data)
    if (res.error) throw new Error(res.error.message)
    this._categories.update(list => [...list, res.data!])
    return res.data!
  }

  async update(data: UpdateExpenseCategoryDto): Promise<ExpenseCategoryDto> {
    const res = await window.api.expenseCategory.update(data)
    if (res.error) throw new Error(res.error.message)
    this._categories.update(list => list.map(c => c.id === data.id ? res.data! : c))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.expenseCategory.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._categories.update(list => list.filter(c => c.id !== id))
  }
}
