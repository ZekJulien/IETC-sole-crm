import { Injectable } from '@angular/core'
import {
  ExpenseDto, CreateExpenseDto, UpdateExpenseDto,
  ExpenseFilter, CategoryAmountCount,
} from '@shared/dtos/expense'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  async getAll(filter?: ExpenseFilter): Promise<ExpenseDto[]> {
    return unwrap(await window.api.expense.getAll(filter))
  }

  async sumByCategory(): Promise<CategoryAmountCount> {
    return unwrap(await window.api.expense.sumByCategory())
  }

  async sumDeductible(year: number): Promise<number> {
    return unwrap(await window.api.expense.sumDeductible({ year }))
  }

  async sumByMonth(year: number): Promise<number[]> {
    return unwrap(await window.api.expense.sumByMonth({ year }))
  }

  async add(data: CreateExpenseDto): Promise<ExpenseDto> {
    return unwrap(await window.api.expense.add(data))
  }

  async update(data: UpdateExpenseDto): Promise<ExpenseDto> {
    return unwrap(await window.api.expense.update(data))
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.expense.remove(id))
  }

  async pickReceipt(): Promise<string | null> {
    return unwrap(await window.api.expense.pickReceipt()) ?? null
  }

  async openReceipt(path: string): Promise<void> {
    unwrap(await window.api.expense.openReceipt(path))
  }
}
