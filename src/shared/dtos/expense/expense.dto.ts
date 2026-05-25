import { ExpenseReceiptDto } from './expense-receipt.dto'

export interface ExpenseDto {
  id:                  number
  label:               string
  amount:              number
  date:                Date
  notes:               string | null
  expenseCategoryId:   number
  expenseCategoryName: string
  expenseCategoryColor: string
  deductible:          boolean
  projectId:           number | null
  projectName:         string | null
  receipts:            ExpenseReceiptDto[]
}
