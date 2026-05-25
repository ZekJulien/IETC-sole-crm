import { IpcResponse } from '../../types'
import {
  ExpenseDto, CreateExpenseDto, UpdateExpenseDto,
  ExpenseFilter, SumDeductibleDto, CategoryAmountCount,
} from '../../dtos/expense'

export interface ExpenseAPI {
  getAll:        (filter?: ExpenseFilter)  => Promise<IpcResponse<ExpenseDto[]>>
  sumByCategory: ()                        => Promise<IpcResponse<CategoryAmountCount>>
  sumDeductible: (arg: SumDeductibleDto)   => Promise<IpcResponse<number>>
  add:           (data: CreateExpenseDto)  => Promise<IpcResponse<ExpenseDto>>
  update:        (data: UpdateExpenseDto)  => Promise<IpcResponse<ExpenseDto>>
  remove:        (id: number)              => Promise<IpcResponse<void>>
  pickReceipt:   ()                        => Promise<IpcResponse<string | null>>
  openReceipt:   (path: string)            => Promise<IpcResponse<void>>
}
