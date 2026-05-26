import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideArrowLeft, LucideSend, LucideBan, LucideRotateCcw } from '@lucide/angular'
import {
  InvoiceStatus, PaymentMethod, InvoiceDto, PaymentDto,
  CreateInvoiceDto, UpdateInvoiceDto, InvoiceLineInput,
} from '@shared/dtos/invoice'
import { InvoiceStore } from '@app/stores/invoice'
import { ClientStore } from '@app/stores/client/client-store'
import { ProjectStore } from '@app/stores/project'
import { VatRateStore } from '@app/stores/vat-rate'
import { ProductStore } from '@app/stores/product'
import { Button, ConfirmDialog, StatusBadge, LineItemsEditor, buildLineGroup } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency, toInputDate } from '@app/utils'
import { invoiceStatusKey } from '../../utils/invoice-status'
import { PAYMENT_METHODS } from '../../utils/payment-method'
import { PaymentsPanel } from '../../components/payments-panel'

interface InvoiceTotals {
  totalHt:   number
  totalVat:  number
  totalTtc:  number
  breakdown: { rate: number; baseHt: number; vat: number }[]
}

@Component({
  selector: 'app-invoice-detail',
  imports: [
    ReactiveFormsModule, Button, ConfirmDialog, StatusBadge, LineItemsEditor, PaymentsPanel, TranslatePipe,
    LucideArrowLeft, LucideSend, LucideBan, LucideRotateCcw,
  ],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit {
  private readonly fb     = inject(FormBuilder)
  private readonly route  = inject(ActivatedRoute)
  private readonly router = inject(Router)
  readonly store    = inject(InvoiceStore)
  readonly clients  = inject(ClientStore)
  readonly projects = inject(ProjectStore)
  readonly vatRates = inject(VatRateStore)
  readonly products = inject(ProductStore)

  readonly ButtonVariant  = ButtonVariant
  readonly InvoiceStatus   = InvoiceStatus
  readonly statusKey       = invoiceStatusKey
  readonly methods         = PAYMENT_METHODS
  readonly formatCurrency  = formatCurrency

  readonly invoiceId  = signal<number | null>(null)
  readonly number     = signal<string | null>(null)
  readonly status     = signal<InvoiceStatus>(InvoiceStatus.DRAFT)
  readonly payments   = signal<PaymentDto[]>([])
  readonly paidAmount = signal<number>(0)
  readonly confirmOpen = signal(false)
  readonly loading     = signal(false)
  readonly savingPayment = signal(false)
  private readonly formTick = signal(0)
  private suppressClientReset = false

  readonly isEdit   = computed(() => this.invoiceId() !== null)
  readonly titleKey = computed(() => this.isEdit() ? 'invoice.editTitle' : 'invoice.createTitle')
  readonly canRecordPayment = computed(() =>
    this.isEdit() && this.status() !== InvoiceStatus.DRAFT && this.status() !== InvoiceStatus.CANCELLED
  )

  readonly form = this.fb.group({
    clientId:  [null as number | null, [Validators.required]],
    projectId: [null as number | null],
    issueDate: [toInputDate(new Date())],
    dueDate:   [toInputDate(this.defaultDueDate()), [Validators.required]],
    notes:     [''],
    lines:     this.fb.array([] as FormGroup[]),
  })

  readonly paymentForm = this.fb.group({
    date:      [toInputDate(new Date()), [Validators.required]],
    amount:    [0, [Validators.required, Validators.min(0.01)]],
    method:    [PaymentMethod.TRANSFER as PaymentMethod, [Validators.required]],
    reference: [''],
  })

  get linesArray(): FormArray {
    return this.form.controls.lines as FormArray
  }

  readonly availableProjects = computed(() => {
    this.formTick()
    const clientId = this.form.controls.clientId.value
    return clientId ? this.projects.projects().filter(p => p.clientId === clientId) : []
  })

  readonly totals = computed<InvoiceTotals>(() => {
    this.formTick()
    const groups = new Map<number, number>()
    let totalHt = 0
    for (const ctrl of this.linesArray.controls) {
      const { quantity, unitPrice, vatRate } = ctrl.getRawValue()
      const lineHt = (Number(quantity) || 0) * (Number(unitPrice) || 0)
      const rate   = Number(vatRate) || 0
      totalHt += lineHt
      groups.set(rate, (groups.get(rate) ?? 0) + lineHt)
    }
    const breakdown = [...groups.entries()]
      .map(([rate, baseHt]) => ({ rate, baseHt, vat: (baseHt * rate) / 100 }))
      .sort((a, b) => b.rate - a.rate)
    const totalVat = breakdown.reduce((sum, b) => sum + b.vat, 0)
    return { totalHt, totalVat, totalTtc: totalHt + totalVat, breakdown }
  })

  readonly balanceDue = computed(() => Math.max(0, this.totals().totalTtc - this.paidAmount()))
  readonly settled    = computed(() => this.totals().totalTtc > 0 && this.balanceDue() <= 0.005)

  constructor() {
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.formTick.update(t => t + 1))
    this.form.controls.clientId.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (!this.suppressClientReset) this.form.controls.projectId.setValue(null)
    })
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.clients.load(), this.projects.load(), this.vatRates.load(), this.products.load()])
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      const id = Number(idParam)
      this.invoiceId.set(id)
      await this.loadInvoice(id)
    } else {
      this.addEmptyLine()
    }
  }

  private async loadInvoice(id: number): Promise<void> {
    this.loading.set(true)
    const invoice = await this.store.getById(id)
    this.loading.set(false)
    if (!invoice) { this.router.navigate(['/invoices']); return }
    this.applyInvoice(invoice)
    this.suppressClientReset = true
    this.form.patchValue({
      clientId:  invoice.clientId,
      projectId: invoice.projectId,
      issueDate: toInputDate(invoice.issueDate),
      dueDate:   toInputDate(invoice.dueDate),
      notes:     invoice.notes ?? '',
    })
    this.suppressClientReset = false
    this.linesArray.clear()
    for (const line of invoice.lines)
      this.linesArray.push(buildLineGroup(this.fb, line, this.vatRates.defaultRate()))
    if (invoice.lines.length === 0) this.addEmptyLine()
  }

  private applyInvoice(invoice: InvoiceDto): void {
    this.number.set(invoice.number)
    this.status.set(invoice.status)
    this.payments.set(invoice.payments)
    this.paidAmount.set(invoice.paidAmount)
  }

  private addEmptyLine(): void {
    this.linesArray.push(buildLineGroup(this.fb, undefined, this.vatRates.defaultRate()))
  }

  async markStatus(status: InvoiceStatus): Promise<void> {
    const id = this.invoiceId()
    if (id === null) return
    const updated = await this.store.updateStatus({ id, status })
    if (updated) this.applyInvoice(updated)
  }

  fillBalance(): void {
    this.paymentForm.controls.amount.setValue(Number(this.balanceDue().toFixed(2)))
  }

  async recordPayment(): Promise<void> {
    const id = this.invoiceId()
    if (id === null || this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched()
      return
    }
    this.savingPayment.set(true)
    const v = this.paymentForm.getRawValue()
    const updated = await this.store.addPayment({
      invoiceId: id,
      date:      new Date(v.date!),
      amount:    Number(v.amount),
      method:    v.method ?? PaymentMethod.TRANSFER,
      reference: (v.reference ?? '').trim() || null,
    })
    this.savingPayment.set(false)
    if (updated) {
      this.applyInvoice(updated)
      this.paymentForm.reset({
        date:      toInputDate(new Date()),
        amount:    0,
        method:    PaymentMethod.TRANSFER,
        reference: '',
      })
    }
  }

  async deletePayment(paymentId: number): Promise<void> {
    const updated = await this.store.removePayment(paymentId)
    if (updated) this.applyInvoice(updated)
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.linesArray.length === 0) {
      this.form.markAllAsTouched()
      return
    }
    const v     = this.form.getRawValue()
    const notes = (v.notes ?? '').trim() || null
    const lines: InvoiceLineInput[] = this.linesArray.getRawValue().map(l => ({
      id:          l.id ?? undefined,
      description: String(l.description).trim(),
      quantity:    Number(l.quantity),
      unitPrice:   Number(l.unitPrice),
      vatRate:     Number(l.vatRate),
      productId:   l.productId ?? null,
    }))
    const id = this.invoiceId()

    if (id !== null) {
      const payload: UpdateInvoiceDto = {
        id,
        clientId:  v.clientId!,
        projectId: v.projectId ?? null,
        issueDate: new Date(v.issueDate!),
        dueDate:   new Date(v.dueDate!),
        notes,
        lines,
      }
      const updated = await this.store.update(payload)
      if (updated) this.router.navigate(['/invoices'])
    } else {
      const payload: CreateInvoiceDto = {
        clientId:  v.clientId!,
        projectId: v.projectId ?? null,
        issueDate: new Date(v.issueDate!),
        dueDate:   new Date(v.dueDate!),
        notes,
        lines,
      }
      const created = await this.store.add(payload)
      if (created) this.router.navigate(['/invoices'])
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.invoiceId()
    if (id === null) return
    const ok = await this.store.remove(id)
    this.confirmOpen.set(false)
    if (ok) this.router.navigate(['/invoices'])
  }

  cancel(): void {
    this.router.navigate(['/invoices'])
  }

  private defaultDueDate(): Date {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
  }
}
