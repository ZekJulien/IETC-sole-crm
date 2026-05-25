import { AppDependencies } from '../dependencies'
import { registerLogHandlers } from './log.handler'
import { registerClientHandlers, registerContactHandlers } from './client'
import { registerCompanyHandlers } from './company'
import { registerCategoryHandlers } from './category'
import { registerExpenseCategoryHandlers } from './expense-category'
import { registerProjectHandlers } from './project'
import { registerTaskHandlers } from './task'
import { registerTimeEntryHandlers } from './time-entry'
import { registerExpenseHandlers } from './expense'

export function registerAllHandlers(deps: AppDependencies): void {
  registerLogHandlers()
  registerClientHandlers(deps.clientService)
  registerContactHandlers(deps.contactService)
  registerCompanyHandlers(deps.companyService)
  registerCategoryHandlers(deps.categoryService)
  registerExpenseCategoryHandlers(deps.expenseCategoryService)
  registerProjectHandlers(deps.projectService)
  registerTaskHandlers(deps.taskService)
  registerTimeEntryHandlers(deps.timeEntryService)
  registerExpenseHandlers(deps.expenseService)
}
