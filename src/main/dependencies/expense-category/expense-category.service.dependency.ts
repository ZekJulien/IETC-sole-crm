import { ExpenseCategoryService } from '../../services/expense-category/expense-category.service'
import { getExpenseCategoryRepository } from './expense-category.repository.dependency'

let _instance: ExpenseCategoryService | null = null

export function getExpenseCategoryService(): ExpenseCategoryService {
  if (!_instance) _instance = new ExpenseCategoryService(getExpenseCategoryRepository())
  return _instance
}
