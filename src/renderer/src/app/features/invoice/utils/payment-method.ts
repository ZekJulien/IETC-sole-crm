import { PaymentMethod } from '@shared/dtos/invoice'
import { statusKey } from '@app/utils'

export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.TRANSFER,
  PaymentMethod.CHECK,
  PaymentMethod.CASH,
  PaymentMethod.CARD,
]

export function paymentMethodKey(method: PaymentMethod | string): string {
  return statusKey('invoice.method.', method)
}
