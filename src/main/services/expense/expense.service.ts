import { ExpenseRepository, ExpenseWithRelations } from '../../repositories/expense/expense.repository'
import { BaseService } from '../base.service'
import {
  ExpenseDto, CreateExpenseDto, UpdateExpenseDto,
  ExpenseFilter, SumDeductibleDto, ExpenseSumByMonthDto, CategoryAmountCount,
} from '@shared/dtos/expense'

export interface ReceiptInput { name: string; path: string }

type ExpenseScalar = Omit<CreateExpenseDto, 'receiptPaths'>
type ExpenseUpdate = Omit<UpdateExpenseDto, 'keepReceiptIds' | 'newReceiptPaths'>

export class ExpenseService extends BaseService<ExpenseWithRelations, ExpenseDto> {
  constructor(private readonly repo: ExpenseRepository) { super() }

  async getAll(filter?: ExpenseFilter): Promise<ExpenseDto[]> {
    const expenses = await this.repo.findAll(filter)
    return expenses.map(e => this.toDto(e))
  }

  sumByCategory(): Promise<CategoryAmountCount> {
    return this.repo.sumByCategory()
  }

  sumDeductible(arg: SumDeductibleDto): Promise<number> {
    return this.repo.sumDeductible(arg.year)
  }

  sumByMonth(arg: ExpenseSumByMonthDto): Promise<number[]> {
    return this.repo.sumByMonth(arg.year)
  }

  async getReceipts(expenseId: number): Promise<{ id: number; path: string }[]> {
    const receipts = await this.repo.findReceipts(expenseId)
    return receipts.map(r => ({ id: r.id, path: r.path }))
  }

  async add(data: ExpenseScalar, receipts: ReceiptInput[]): Promise<ExpenseDto> {
    const created = await this.repo.create(data)
    for (const r of receipts) await this.repo.addReceipt(created.id, r.name, r.path)
    return this.toDto((await this.repo.findByIdWithRelations(created.id))!)
  }

  async update(data: ExpenseUpdate, keepReceiptIds: number[] | undefined, newReceipts: ReceiptInput[]): Promise<ExpenseDto> {
    if (keepReceiptIds) {
      const keep = new Set(keepReceiptIds)
      for (const r of await this.repo.findReceipts(data.id)) {
        if (!keep.has(r.id)) await this.repo.removeReceipt(r.id)
      }
    }
    for (const r of newReceipts) await this.repo.addReceipt(data.id, r.name, r.path)
    await this.repo.update(data)
    return this.toDto((await this.repo.findByIdWithRelations(data.id))!)
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(e: ExpenseWithRelations): ExpenseDto {
    return {
      id:                   e.id,
      label:                e.label,
      amount:               e.amount,
      date:                 e.date,
      notes:                e.notes,
      expenseCategoryId:    e.expenseCategoryId,
      expenseCategoryName:  e.expenseCategory.name,
      expenseCategoryColor: e.expenseCategory.color,
      deductible:           e.expenseCategory.deductible,
      projectId:            e.projectId,
      projectName:          e.project?.name ?? null,
      receipts:             e.receipts.map(r => ({ id: r.id, name: r.name, path: r.path })),
    }
  }
}
