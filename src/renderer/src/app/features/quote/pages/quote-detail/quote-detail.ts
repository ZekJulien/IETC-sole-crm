import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideArrowLeft, LucidePlus, LucideTrash2, LucideCheck, LucideX, LucideSend } from '@lucide/angular'
import { QuoteStatus, QuoteLineDto, CreateQuoteDto, UpdateQuoteDto, QuoteLineInput } from '@shared/dtos/quote'
import { QuoteStore } from '@app/stores/quote'
import { ClientStore } from '@app/stores/client/client-store'
import { ProjectStore } from '@app/stores/project'
import { VatRateStore } from '@app/stores/vat-rate'
import { ProductStore } from '@app/stores/product'
import { Button, ConfirmDialog, Combobox } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency, toInputDate } from '@app/utils'
import { QUOTE_STATUSES, quoteStatusKey } from '../../utils/quote-status'

interface QuoteTotals {
  totalHt:   number
  totalVat:  number
  totalTtc:  number
  breakdown: { rate: number; baseHt: number; vat: number }[]
}

@Component({
  selector: 'app-quote-detail',
  imports: [
    ReactiveFormsModule, Button, ConfirmDialog, Combobox, TranslatePipe,
    LucideArrowLeft, LucidePlus, LucideTrash2, LucideCheck, LucideX, LucideSend,
  ],
  templateUrl: './quote-detail.html',
  styleUrl: './quote-detail.css',
})
export class QuoteDetail implements OnInit {
  private readonly fb     = inject(FormBuilder)
  private readonly route  = inject(ActivatedRoute)
  private readonly router = inject(Router)
  readonly store    = inject(QuoteStore)
  readonly clients  = inject(ClientStore)
  readonly projects = inject(ProjectStore)
  readonly vatRates = inject(VatRateStore)
  readonly products = inject(ProductStore)

  readonly ButtonVariant  = ButtonVariant
  readonly QuoteStatus    = QuoteStatus
  readonly statuses       = QUOTE_STATUSES
  readonly statusKey      = quoteStatusKey
  readonly formatCurrency = formatCurrency

  readonly quoteId     = signal<number | null>(null)
  readonly number      = signal<string | null>(null)
  readonly confirmOpen = signal(false)
  readonly loading     = signal(false)
  private readonly formTick = signal(0)
  private suppressClientReset = false

  readonly isEdit   = computed(() => this.quoteId() !== null)
  readonly titleKey = computed(() => this.isEdit() ? 'quote.editTitle' : 'quote.createTitle')

  readonly form = this.fb.group({
    clientId:   [null as number | null, [Validators.required]],
    projectId:  [null as number | null],
    issueDate:  [toInputDate(new Date())],
    validUntil: [toInputDate(this.defaultValidUntil()), [Validators.required]],
    status:     [QuoteStatus.DRAFT as QuoteStatus, [Validators.required]],
    notes:      [''],
    lines:      this.fb.array([] as FormGroup[]),
  })

  get linesArray(): FormArray {
    return this.form.controls.lines as FormArray
  }

  readonly productNames = computed(() => this.products.products().map(p => p.name))

  readonly availableProjects = computed(() => {
    this.formTick()
    const clientId = this.form.controls.clientId.value
    return clientId ? this.projects.projects().filter(p => p.clientId === clientId) : []
  })

  readonly totals = computed<QuoteTotals>(() => {
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
      this.quoteId.set(id)
      await this.loadQuote(id)
    } else {
      this.addLine()
    }
  }

  private async loadQuote(id: number): Promise<void> {
    this.loading.set(true)
    const quote = await this.store.getById(id)
    this.loading.set(false)
    if (!quote) { this.router.navigate(['/quotes']); return }
    this.number.set(quote.number)
    this.suppressClientReset = true
    this.form.patchValue({
      clientId:   quote.clientId,
      projectId:  quote.projectId,
      issueDate:  toInputDate(quote.issueDate),
      validUntil: toInputDate(quote.validUntil),
      status:     quote.status,
      notes:      quote.notes ?? '',
    })
    this.suppressClientReset = false
    this.linesArray.clear()
    for (const line of quote.lines) this.linesArray.push(this.lineGroup(line))
    if (quote.lines.length === 0) this.addLine()
  }

  private lineGroup(line?: QuoteLineDto): FormGroup {
    return this.fb.group({
      id:          [line?.id ?? null as number | null],
      productId:   [line?.productId ?? null as number | null],
      description: [line?.description ?? '', [Validators.required]],
      quantity:    [line?.quantity ?? 1, [Validators.required, Validators.min(0.01)]],
      unitPrice:   [line?.unitPrice ?? 0, [Validators.required, Validators.min(0)]],
      vatRate:     [line?.vatRate ?? this.vatRates.defaultRate(), [Validators.required]],
    })
  }

  addLine(): void {
    this.linesArray.push(this.lineGroup())
  }

  removeLine(index: number): void {
    this.linesArray.removeAt(index)
  }

  lineTotal(index: number): number {
    const { quantity, unitPrice } = this.linesArray.at(index).getRawValue()
    return (Number(quantity) || 0) * (Number(unitPrice) || 0)
  }

  onDescriptionInput(index: number, value: string): void {
    const ctrl = this.linesArray.at(index)
    ctrl.get('description')!.setValue(value)
    if (!this.products.products().some(p => p.name === value.trim())) {
      ctrl.get('productId')!.setValue(null)
    }
  }

  onDescriptionChange(index: number, value: string): void {
    const ctrl    = this.linesArray.at(index)
    const product = this.products.products().find(p => p.name === value.trim())
    if (!product) return
    ctrl.patchValue({
      description: product.name,
      productId:   product.id,
      unitPrice:   product.unitPrice,
      vatRate:     product.vatRate,
    })
  }

  async markStatus(status: QuoteStatus): Promise<void> {
    const id = this.quoteId()
    if (id === null) return
    const updated = await this.store.updateStatus({ id, status })
    if (updated) this.form.controls.status.setValue(updated.status)
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.linesArray.length === 0) {
      this.form.markAllAsTouched()
      return
    }
    const v     = this.form.getRawValue()
    const notes = (v.notes ?? '').trim() || null
    const lines: QuoteLineInput[] = this.linesArray.getRawValue().map(l => ({
      id:          l.id ?? undefined,
      description: String(l.description).trim(),
      quantity:    Number(l.quantity),
      unitPrice:   Number(l.unitPrice),
      vatRate:     Number(l.vatRate),
      productId:   l.productId ?? null,
    }))
    const id = this.quoteId()

    if (id !== null) {
      const payload: UpdateQuoteDto = {
        id,
        clientId:   v.clientId!,
        projectId:  v.projectId ?? null,
        issueDate:  new Date(v.issueDate!),
        validUntil: new Date(v.validUntil!),
        status:     v.status ?? QuoteStatus.DRAFT,
        notes,
        lines,
      }
      const updated = await this.store.update(payload)
      if (updated) this.router.navigate(['/quotes'])
    } else {
      const payload: CreateQuoteDto = {
        clientId:   v.clientId!,
        projectId:  v.projectId ?? null,
        issueDate:  new Date(v.issueDate!),
        validUntil: new Date(v.validUntil!),
        status:     v.status ?? QuoteStatus.DRAFT,
        notes,
        lines,
      }
      const created = await this.store.add(payload)
      if (created) this.router.navigate(['/quotes'])
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.quoteId()
    if (id === null) return
    const ok = await this.store.remove(id)
    this.confirmOpen.set(false)
    if (ok) this.router.navigate(['/quotes'])
  }

  cancel(): void {
    this.router.navigate(['/quotes'])
  }

  private defaultValidUntil(): Date {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d
  }
}
