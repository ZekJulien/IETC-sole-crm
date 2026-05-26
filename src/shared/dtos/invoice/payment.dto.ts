import { PaymentMethod } from './payment-method.enum'

export interface PaymentDto {
  id:        number
  date:      Date
  amount:    number
  method:    PaymentMethod
  reference: string | null
}
