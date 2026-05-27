import { ipcRenderer } from 'electron'
import { EXPENSE_CHANNELS } from '@shared/channels/expense'
import { ExpenseAPI } from '@shared/interfaces/expense'

export const expenseApi: ExpenseAPI = {
  getAll:        (filter) => ipcRenderer.invoke(EXPENSE_CHANNELS.GET_ALL, filter),
  sumByCategory: ()       => ipcRenderer.invoke(EXPENSE_CHANNELS.SUM_BY_CATEGORY),
  sumDeductible: (arg)    => ipcRenderer.invoke(EXPENSE_CHANNELS.SUM_DEDUCTIBLE, arg),
  sumByMonth:    (arg)    => ipcRenderer.invoke(EXPENSE_CHANNELS.SUM_BY_MONTH, arg),
  add:           (data)   => ipcRenderer.invoke(EXPENSE_CHANNELS.ADD, data),
  update:        (data)   => ipcRenderer.invoke(EXPENSE_CHANNELS.UPDATE, data),
  remove:        (id)     => ipcRenderer.invoke(EXPENSE_CHANNELS.REMOVE, id),
  pickReceipt:   ()       => ipcRenderer.invoke(EXPENSE_CHANNELS.PICK_RECEIPT),
  openReceipt:   (path)   => ipcRenderer.invoke(EXPENSE_CHANNELS.OPEN_RECEIPT, path),
}
