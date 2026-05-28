import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms'
import { LucideArrowLeft, LucideCheck, LucideX, LucideSend, LucideFileText, LucideDownload } from '@lucide/angular'
import { QuoteStatus, QuoteDto, CreateQuoteDto, UpdateQuoteDto, QuoteLineInput } from '@shared/dtos/quote'
import { ConvertQuoteDto, QuoteBillingDto } from '@shared/dtos/conversion'
import { computeDocumentTotals } from '@shared/utils/document-totals'
import { QuoteStore } from '@app/stores/quote'
import { ClientStore } from '@app/stores/client/client-store'
import { ProjectStore } from '@app/stores/project'
import { VatRateStore } from '@app/stores/vat-rate'
import { ProductStore } from '@app/stores/product'
import { Button, ConfirmDialog, LineItemsEditor, buildLineGroup } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency, toInputDate } from '@app/utils'
import { I18nService } from '@app/services/i18n/i18n'
import { QUOTE_STATUSES, quoteStatusKey } from '../../utils/quote-status'
import { QuoteConvertModal } from '../../components/quote-convert-modal/quote-convert-modal'

interface QuoteTotals {
  totalHt:   number
  totalVat:  number
  totalTtc:  number
  breakdown: { rate: number; baseHt: number; vat: number }[]
}

@Component({
  selector: 'app-quote-detail',
  imports: [
    ReactiveFormsModule, Button, ConfirmDialog, LineItemsEditor, QuoteConvertModal, TranslatePipe,
    LucideArrowLeft, LucideCheck, LucideX, LucideSend, LucideFileText, LucideDownload,
  ],
  templateUrl: './quote-detail.html',
  styleUrl: './quote-detail.css',
})
export class QuoteDetail implements OnInit {
  private readonly fb     = inject(FormBuilder)
  private readonly route  = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly i18n   = inject(I18nService)
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
  readonly quote       = signal<QuoteDto | null>(null)
  readonly billing     = signal<QuoteBillingDto | null>(null)
  readonly confirmOpen = signal(false)
  readonly convertOpen = signal(false)
  readonly loading     = signal(false)
  readonly exporting   = signal(false)
  private readonly formTick = signal(0)
  private suppressClientReset = false

  readonly isAccepted = computed(() => this.quote()?.status === QuoteStatus.ACCEPTED)

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

  readonly availableProjects = computed(() => {
    this.formTick()
    const clientId = this.form.controls.clientId.value
    return clientId ? this.projects.projects().filter(p => p.clientId === clientId) : []
  })

  readonly totals = computed<QuoteTotals>(() => {
    this.formTick()
    const lines = this.linesArray.controls.map(c => c.getRawValue())
    const { totalHt, totalVat, totalTtc, vatBreakdown } = computeDocumentTotals(lines)
    return { totalHt, totalVat, totalTtc, breakdown: vatBreakdown }
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
      this.addEmptyLine()
    }
  }

  private async loadQuote(id: number): Promise<void> {
    this.loading.set(true)
    const quote = await this.store.getById(id)
    this.loading.set(false)
    if (!quote) { this.router.navigate(['/quotes']); return }
    this.quote.set(quote)
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
    for (const line of quote.lines)
      this.linesArray.push(buildLineGroup(this.fb, line, this.vatRates.defaultRate()))
    if (quote.lines.length === 0) this.addEmptyLine()
    if (quote.status === QuoteStatus.ACCEPTED) this.billing.set(await this.store.getQuoteBilling(id))
  }

  private addEmptyLine(): void {
    this.linesArray.push(buildLineGroup(this.fb, undefined, this.vatRates.defaultRate()))
  }

  async markStatus(status: QuoteStatus): Promise<void> {
    const id = this.quoteId()
    if (id === null) return
    const updated = await this.store.updateStatus({ id, status })
    if (updated) this.form.controls.status.setValue(updated.status)
  }

  async convert(data: ConvertQuoteDto): Promise<void> {
    const result = await this.store.convertQuote(data)
    this.convertOpen.set(false)
    if (!result) return
    if (result.invoiceId !== null) this.router.navigate(['/invoices', result.invoiceId])
    else                           this.router.navigate(['/projects', result.projectId])
  }

  async exportPdf(): Promise<void> {
    const id = this.quoteId()
    if (id === null) return
    this.exporting.set(true)
    await this.store.exportPdf(id)
    this.exporting.set(false)
  }

  async invoiceBalance(): Promise<void> {
    const q = this.quote()
    if (!q) return
    const label  = this.i18n.t('conversion.balance.lineLabel', { number: q.number })
    const result = await this.store.invoiceBalance({ quoteId: q.id, label })
    if (result) this.router.navigate(['/invoices', result.invoiceId])
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
      discount:    Number(l.discount) || 0,
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
