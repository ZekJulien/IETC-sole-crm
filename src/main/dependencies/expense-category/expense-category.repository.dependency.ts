import { getDbContext } from '../../core'
import { ExpenseCategoryRepository } from '../../repositories/expense-category/expense-category.repository'

let _instance: ExpenseCategoryRepository | null = null

export function getExpenseCategoryRepository(): ExpenseCategoryRepository {
  if (!_instance) _instance = new ExpenseCategoryRepository(getDbContext())
  return _instance
}
