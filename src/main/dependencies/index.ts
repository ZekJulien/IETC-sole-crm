import { ClientService, ContactService } from '../services/client'
import { CompanyService } from '../services/company'
import { CategoryService } from '../services/category'
import { ExpenseCategoryService } from '../services/expense-category'
import { ProjectService } from '../services/project'
import { TaskService } from '../services/task'
import { TimeEntryService } from '../services/time-entry'
import { getClientService, getContactService } from './client'
import { getCompanyService } from './company'
import { getCategoryService } from './category'
import { getExpenseCategoryService } from './expense-category'
import { getProjectService } from './project'
import { getTaskService } from './task'
import { getTimeEntryService } from './time-entry'

export interface AppDependencies {
  clientService:  ClientService
  contactService: ContactService
  companyService: CompanyService
  categoryService: CategoryService
  expenseCategoryService: ExpenseCategoryService
  projectService: ProjectService
  taskService: TaskService
  timeEntryService: TimeEntryService
}

export function buildDependencies(): AppDependencies {
  return {
    clientService:  getClientService(),
    contactService: getContactService(),
    companyService: getCompanyService(),
    categoryService: getCategoryService(),
    expenseCategoryService: getExpenseCategoryService(),
    projectService: getProjectService(),
    taskService: getTaskService(),
    timeEntryService: getTimeEntryService(),
  }
}
