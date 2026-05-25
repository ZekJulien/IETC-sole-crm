import { getDbContext } from '../../core'
import { ExpenseRepository } from '../../repositories/expense/expense.repository'

let _instance: ExpenseRepository | null = null

export function getExpenseRepository(): ExpenseRepository {
  if (!_instance) _instance = new ExpenseRepository(getDbContext())
  return _instance
}
