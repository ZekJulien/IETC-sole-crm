import { IpcResponse, FindManyArgs, PaginatedResult } from '../../types'
import { ExpenseCategoryDto, CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '../../dtos/expense-category'

export interface ExpenseCategoryAPI {
  get:    (args?: FindManyArgs)            => Promise<IpcResponse<PaginatedResult<ExpenseCategoryDto>>>
  add:    (data: CreateExpenseCategoryDto) => Promise<IpcResponse<ExpenseCategoryDto>>
  update: (data: UpdateExpenseCategoryDto) => Promise<IpcResponse<ExpenseCategoryDto>>
  remove: (id: number)                     => Promise<IpcResponse<void>>
}
