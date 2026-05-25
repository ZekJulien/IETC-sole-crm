import { Expense, ExpenseCategory, ExpenseReceipt, Project } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'
import { ExpenseFilter, CategoryAmountCount } from '@shared/dtos/expense'

export type ExpenseWithRelations = Expense & {
  expenseCategory: ExpenseCategory
  project: Project | null
  receipts: ExpenseReceipt[]
}

export class ExpenseRepository extends BaseRepository<Expense> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.expense,
      { include: { expenseCategory: true, project: true, receipts: true }, orderBy: { date: 'desc' } },
      ['label'],
    )
  }

  findAll(filter?: ExpenseFilter): Promise<ExpenseWithRelations[]> {
    const where: Record<string, unknown> = {}
    if (filter?.expenseCategoryId) where['expenseCategoryId'] = filter.expenseCategoryId
    if (filter?.from || filter?.to) {
      const range: Record<string, Date> = {}
      if (filter.from) range['gte'] = filter.from
      if (filter.to)   range['lte'] = endOfDay(filter.to)
      where['date'] = range
    }
    return this.delegate.findMany({
      where,
      include: { expenseCategory: true, project: true, receipts: true },
      orderBy: { date: 'desc' },
    })
  }

  findByIdWithRelations(id: number): Promise<ExpenseWithRelations | null> {
    return this.delegate.findUnique({
      where: { id },
      include: { expenseCategory: true, project: true, receipts: true },
    })
  }

  findReceipts(expenseId: number): Promise<ExpenseReceipt[]> {
    return this.dbContext.client.expenseReceipt.findMany({ where: { expenseId } })
  }

  addReceipt(expenseId: number, name: string, path: string): Promise<ExpenseReceipt> {
    return this.dbContext.client.expenseReceipt.create({ data: { expenseId, name, path } })
  }

  async removeReceipt(id: number): Promise<void> {
    await this.dbContext.client.expenseReceipt.delete({ where: { id } })
  }

  async sumByCategory(): Promise<CategoryAmountCount> {
    const groups: { expenseCategoryId: number; _sum: { amount: number | null } }[] =
      await this.delegate.groupBy({ by: ['expenseCategoryId'], _sum: { amount: true } })
    return Object.fromEntries(groups.map(g => [g.expenseCategoryId, g._sum.amount ?? 0])) as CategoryAmountCount
  }

  async sumDeductible(year: number): Promise<number> {
    const start = new Date(year, 0, 1)
    const end   = new Date(year + 1, 0, 1)
    const res: { _sum: { amount: number | null } } = await this.delegate.aggregate({
      _sum:  { amount: true },
      where: { date: { gte: start, lt: end }, expenseCategory: { deductible: true } },
    })
    return res._sum.amount ?? 0
  }
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}
