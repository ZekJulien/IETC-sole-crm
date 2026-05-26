import { PaymentMethod } from '@shared/dtos/invoice'

export const PAYMENT_METHODS: PaymentMethod[] = [
  PaymentMethod.TRANSFER,
  PaymentMethod.CHECK,
  PaymentMethod.CASH,
  PaymentMethod.CARD,
]

export function paymentMethodKey(method: PaymentMethod | string): string {
  return 'invoice.method.' + String(method).toLowerCase()
}
