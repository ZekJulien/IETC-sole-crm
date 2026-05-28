import { dialog, shell, BrowserWindow, OpenDialogOptions } from 'electron'
import { z } from 'zod'
import { EXPENSE_CHANNELS } from '@shared/channels/expense'
import {
  CreateExpenseSchema, UpdateExpenseSchema, ExpenseFilterSchema, SumDeductibleSchema,
  ExpenseSumByMonthSchema,
} from '@shared/dtos/expense'
import { IdSchema } from '@shared/types'
import { ipcHandle, ipcHandleNoTx } from '../../core/ipc.handle'
import { persistWithFiles, isManagedFile } from '../../core'
import { ExpenseService } from '../../services/expense/expense.service'

const RECEIPT_SCOPE = 'expenses'

export function registerExpenseHandlers(service: ExpenseService): void {
  ipcHandle(EXPENSE_CHANNELS.GET_ALL,        ExpenseFilterSchema, (filter) => service.getAll(filter))
  ipcHandle(EXPENSE_CHANNELS.SUM_BY_CATEGORY,                     ()       => service.sumByCategory())
  ipcHandle(EXPENSE_CHANNELS.SUM_DEDUCTIBLE,  SumDeductibleSchema, (arg)    => service.sumDeductible(arg))
  ipcHandle(EXPENSE_CHANNELS.SUM_BY_MONTH,    ExpenseSumByMonthSchema, (arg) => service.sumByMonth(arg))

  ipcHandleNoTx(EXPENSE_CHANNELS.ADD, CreateExpenseSchema, (data) => {
    const { receiptPaths, ...scalar } = data
    return persistWithFiles({
      scope: RECEIPT_SCOPE, incoming: receiptPaths, date: scalar.date,
      run: (staged) => service.add(scalar, staged),
    })
  })

  ipcHandleNoTx(EXPENSE_CHANNELS.UPDATE, UpdateExpenseSchema, async (data) => {
    const { keepReceiptIds, newReceiptPaths, ...scalar } = data
    const obsolete = keepReceiptIds
      ? (await service.getReceipts(scalar.id)).filter(r => !keepReceiptIds.includes(r.id)).map(r => r.path)
      : []
    return persistWithFiles({
      scope: RECEIPT_SCOPE, incoming: newReceiptPaths, obsolete, date: scalar.date,
      run: (staged) => service.update(scalar, keepReceiptIds, staged),
    })
  })

  ipcHandleNoTx(EXPENSE_CHANNELS.REMOVE, IdSchema, async (id) => {
    const obsolete = (await service.getReceipts(id)).map(r => r.path)
    return persistWithFiles({ scope: RECEIPT_SCOPE, obsolete, run: () => service.remove(id) })
  })

  ipcHandleNoTx(EXPENSE_CHANNELS.PICK_RECEIPT,                 ()     => pickReceipt())
  ipcHandleNoTx(EXPENSE_CHANNELS.OPEN_RECEIPT, z.string(),     (path) =>
    isManagedFile(path) ? shell.openPath(path) : Promise.resolve(''))
}

async function pickReceipt(): Promise<string | null> {
  const options: OpenDialogOptions = {
    properties: ['openFile'],
    filters: [{ name: 'Justificatifs', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'webp'] }],
  }
  const win = BrowserWindow.getFocusedWindow()
  const result = win
    ? await dialog.showOpenDialog(win, options)
    : await dialog.showOpenDialog(options)
  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0]
}
