import { Component, input, output } from '@angular/core'
import { ReactiveFormsModule, FormGroup } from '@angular/forms'
import { LucideTrash2 } from '@lucide/angular'
import { PaymentDto, PaymentMethod } from '@shared/dtos/invoice'
import { Button } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency, formatDate } from '@app/utils'
import { paymentMethodKey } from '../../utils/payment-method'

@Component({
  selector: 'app-payments-panel',
  imports: [ReactiveFormsModule, Button, TranslatePipe, LucideTrash2],
  templateUrl: './payments-panel.html',
  styleUrl: './payments-panel.css',
})
export class PaymentsPanel {
  readonly payments  = input<PaymentDto[]>([])
  readonly form      = input.required<FormGroup>()
  readonly methods   = input<PaymentMethod[]>([])
  readonly canRecord = input<boolean>(false)
  readonly settled   = input<boolean>(false)
  readonly saving    = input<boolean>(false)

  readonly record = output<void>()
  readonly remove = output<number>()
  readonly fill   = output<void>()

  readonly ButtonVariant  = ButtonVariant
  readonly methodKey      = paymentMethodKey
  readonly formatCurrency = formatCurrency
  readonly formatDate     = formatDate
}
