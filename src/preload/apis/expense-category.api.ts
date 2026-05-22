import { ipcRenderer } from 'electron'
import { EXPENSE_CATEGORY_CHANNELS } from '@shared/channels/expense-category'
import { ExpenseCategoryAPI } from '@shared/interfaces/expense-category'

export const expenseCategoryApi: ExpenseCategoryAPI = {
  get:    (args)  => ipcRenderer.invoke(EXPENSE_CATEGORY_CHANNELS.GET, args),
  add:    (data)  => ipcRenderer.invoke(EXPENSE_CATEGORY_CHANNELS.ADD, data),
  update: (data)  => ipcRenderer.invoke(EXPENSE_CATEGORY_CHANNELS.UPDATE, data),
  remove: (id)    => ipcRenderer.invoke(EXPENSE_CATEGORY_CHANNELS.REMOVE, id),
}
