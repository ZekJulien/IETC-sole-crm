import { ExpenseCategory } from '@db/client'
import { BaseRepository } from '../base.repository'
import { DbContext } from '../../core/db-context'

export class ExpenseCategoryRepository extends BaseRepository<ExpenseCategory> {
  constructor(dbContext: DbContext) {
    super(
      dbContext,
      db => db.expenseCategory,
      { orderBy: { name: 'asc' } },
      ['name'],
    )
  }
}
