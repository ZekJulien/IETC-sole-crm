import { Injectable, computed, inject, signal } from '@angular/core'
import {
  ExpenseDto, CreateExpenseDto, UpdateExpenseDto,
  ExpenseFilter, CategoryAmountCount,
} from '@shared/dtos/expense'
import { ExpenseService } from '@app/services/expense/expense'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class ExpenseStore {
  private readonly expenseSvc = inject(ExpenseService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _expenses        = signal<ExpenseDto[]>([])
  private readonly _byCategory      = signal<CategoryAmountCount>({})
  private readonly _deductibleTotal = signal<number>(0)
  private readonly _loading         = signal<boolean>(false)
  private readonly _saving          = signal<boolean>(false)
  private filter: ExpenseFilter = undefined

  readonly expenses        = this._expenses.asReadonly()
  readonly byCategory      = this._byCategory.asReadonly()
  readonly deductibleTotal = this._deductibleTotal.asReadonly()
  readonly loading         = this._loading.asReadonly()
  readonly saving          = this._saving.asReadonly()
  readonly isEmpty         = computed(() => this._expenses().length === 0)

  async load(filter?: ExpenseFilter): Promise<void> {
    this.filter = filter
    this._loading.set(true)
    try {
      await this.refresh()
    } catch (e) { this.errors.handle(e) }
    finally    { this._loading.set(false) }
  }

  async add(data: CreateExpenseDto): Promise<boolean> {
    this._saving.set(true)
    try {
      await this.expenseSvc.add(data)
      await this.refresh()
      this.toast.success(this.i18n.t('expense.toast.created'))
      return true
    } catch (e) { this.errors.handle(e); return false }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateExpenseDto): Promise<boolean> {
    this._saving.set(true)
    try {
      await this.expenseSvc.update(data)
      await this.refresh()
      this.toast.success(this.i18n.t('expense.toast.saved'))
      return true
    } catch (e) { this.errors.handle(e); return false }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<boolean> {
    try {
      await this.expenseSvc.remove(id)
      await this.refresh()
      this.toast.success(this.i18n.t('expense.toast.deleted'))
      return true
    } catch (e) { this.errors.handle(e); return false }
  }

  async pickReceipt(): Promise<string | null> {
    try {
      return await this.expenseSvc.pickReceipt()
    } catch (e) { this.errors.handle(e); return null }
  }

  async openReceipt(path: string): Promise<void> {
    try {
      await this.expenseSvc.openReceipt(path)
    } catch (e) { this.errors.handle(e) }
  }

  private async refresh(): Promise<void> {
    const year = new Date().getFullYear()
    const [expenses, byCategory, deductible] = await Promise.all([
      this.expenseSvc.getAll(this.filter),
      this.expenseSvc.sumByCategory(),
      this.expenseSvc.sumDeductible(year),
    ])
    this._expenses.set(expenses)
    this._byCategory.set(byCategory)
    this._deductibleTotal.set(deductible)
  }
}
