export enum EXPENSE_CHANNELS {
  GET_ALL         = 'expense:get-all',
  SUM_BY_CATEGORY = 'expense:sum-by-category',
  SUM_DEDUCTIBLE  = 'expense:sum-deductible',
  ADD             = 'expense:add',
  UPDATE          = 'expense:update',
  REMOVE          = 'expense:remove',
  PICK_RECEIPT    = 'expense:pick-receipt',
  OPEN_RECEIPT    = 'expense:open-receipt',
}
