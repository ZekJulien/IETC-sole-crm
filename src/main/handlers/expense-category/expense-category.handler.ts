import { EXPENSE_CATEGORY_CHANNELS } from '@shared/channels/expense-category'
import { CreateExpenseCategorySchema, UpdateExpenseCategorySchema } from '@shared/dtos/expense-category'
import { FindManyArgsSchema, IdSchema } from '@shared/types'
import { ipcHandle } from '../../core/ipc.handle'
import { ExpenseCategoryService } from '../../services/expense-category/expense-category.service'

export function registerExpenseCategoryHandlers(service: ExpenseCategoryService): void {
  ipcHandle(EXPENSE_CATEGORY_CHANNELS.GET,    FindManyArgsSchema,          (args) => service.get(args))
  ipcHandle(EXPENSE_CATEGORY_CHANNELS.ADD,    CreateExpenseCategorySchema, (data) => service.add(data))
  ipcHandle(EXPENSE_CATEGORY_CHANNELS.UPDATE, UpdateExpenseCategorySchema, (data) => service.update(data))
  ipcHandle(EXPENSE_CATEGORY_CHANNELS.REMOVE, IdSchema,                    (id)   => service.remove(id))
}
