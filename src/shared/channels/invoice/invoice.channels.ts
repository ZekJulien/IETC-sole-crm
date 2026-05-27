export enum INVOICE_CHANNELS {
  GET             = 'invoice:get',
  GET_BY_ID       = 'invoice:get-by-id',
  COUNT_BY_STATUS = 'invoice:count-by-status',
  GET_STATS       = 'invoice:get-stats',
  SUM_PAYMENTS_BY_MONTH = 'invoice:sum-payments-by-month',
  ADD             = 'invoice:add',
  UPDATE          = 'invoice:update',
  UPDATE_STATUS   = 'invoice:update-status',
  REMOVE          = 'invoice:remove',
  ADD_PAYMENT     = 'invoice:add-payment',
  REMOVE_PAYMENT  = 'invoice:remove-payment',
}
