import { Injectable } from '@angular/core'
import {
  ExpenseDto, CreateExpenseDto, UpdateExpenseDto,
  ExpenseFilter, CategoryAmountCount,
} from '@shared/dtos/expense'

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  async getAll(filter?: ExpenseFilter): Promise<ExpenseDto[]> {
    const res = await window.api.expense.getAll(filter)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async sumByCategory(): Promise<CategoryAmountCount> {
    const res = await window.api.expense.sumByCategory()
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async sumDeductible(year: number): Promise<number> {
    const res = await window.api.expense.sumDeductible({ year })
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async sumByMonth(year: number): Promise<number[]> {
    const res = await window.api.expense.sumByMonth({ year })
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async add(data: CreateExpenseDto): Promise<ExpenseDto> {
    const res = await window.api.expense.add(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async update(data: UpdateExpenseDto): Promise<ExpenseDto> {
    const res = await window.api.expense.update(data)
    if (res.error) throw new Error(res.error.message)
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.expense.remove(id)
    if (res.error) throw new Error(res.error.message)
  }

  async pickReceipt(): Promise<string | null> {
    const res = await window.api.expense.pickReceipt()
    if (res.error) throw new Error(res.error.message)
    return res.data ?? null
  }

  async openReceipt(path: string): Promise<void> {
    const res = await window.api.expense.openReceipt(path)
    if (res.error) throw new Error(res.error.message)
  }
}
