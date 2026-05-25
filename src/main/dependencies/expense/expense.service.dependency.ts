import { ExpenseService } from '../../services/expense/expense.service'
import { getExpenseRepository } from './expense.repository.dependency'

let _instance: ExpenseService | null = null

export function getExpenseService(): ExpenseService {
  if (!_instance) _instance = new ExpenseService(getExpenseRepository())
  return _instance
}
