import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { CompanyDto, SaveCompanyInput } from '@shared/dtos/company'
import { formatNumber } from '@shared/utils/format-number'
import { FormField, Button } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import {
  companyValidators,
  numberFormatValidator,
  zipCodeValidator,
  vatNumberValidator,
  companyNumberValidator,
} from '../../utils/company-form-validators'

@Component({
  selector: 'app-company-form',
  imports: [ReactiveFormsModule, FormField, Button, TranslatePipe],
  templateUrl: './company-form.html',
  styleUrl: './company-form.css',
})
export class CompanyForm {
  private readonly fb = inject(FormBuilder)
  readonly ButtonVariant = ButtonVariant

  readonly company      = input<CompanyDto | null>(null)
  readonly showCounters = input<boolean>(false)
  readonly submitted    = output<SaveCompanyInput>()
  readonly resetInvoice = output<number>()
  readonly resetQuote   = output<number>()

  readonly invoiceResetValue = signal<number>(0)
  readonly quoteResetValue   = signal<number>(0)

  readonly form = this.fb.group({
    name:          ['', companyValidators.name],
    legalForm:     [''],
    street:        [''],
    zipCode:       ['', zipCodeValidator],
    city:          [''],
    country:       [''],
    email:         ['', companyValidators.email],
    phone:         ['', companyValidators.phone],
    website:       [''],
    companyNumber: ['', companyNumberValidator],
    vatNumber:     ['', vatNumberValidator],
    peppolId:      ['', companyValidators.peppolId],
    iban:          [''],
    bic:           [''],
    defaultVatRate:            [21, companyValidators.vatRate],
    paymentTermsDays:          [30, companyValidators.terms],
    paymentConditions:         [''],
    invoiceNumberFormat:       ['INV-{YYYY}-{####}', [Validators.required, numberFormatValidator]],
    quoteNumberFormat:         ['QUO-{YYYY}-{####}', [Validators.required, numberFormatValidator]],
    invoiceCounterResetYearly: [true],
    quoteCounterResetYearly:   [true],
  })

  private readonly invoiceFormat = toSignal(this.form.controls.invoiceNumberFormat.valueChanges, {
    initialValue: this.form.controls.invoiceNumberFormat.value,
  })
  private readonly quoteFormat = toSignal(this.form.controls.quoteNumberFormat.valueChanges, {
    initialValue: this.form.controls.quoteNumberFormat.value,
  })

  readonly invoicePreview = computed(() => this.preview(this.invoiceFormat(), this.company()?.settings.invoiceNumberCounter))
  readonly quotePreview   = computed(() => this.preview(this.quoteFormat(),   this.company()?.settings.quoteNumberCounter))

  constructor() {
    effect(() => {
      const company = this.company()
      if (company) this.patchForm(company)
    })
  }

  get valid(): boolean {
    return this.form.valid
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      return
    }
    this.submitted.emit(this.buildInput())
  }

  reset(): void {
    const company = this.company()
    if (company) this.patchForm(company)
  }

  revalidateCountryDependent(): void {
    this.form.controls.zipCode.updateValueAndValidity()
    this.form.controls.vatNumber.updateValueAndValidity()
    this.form.controls.companyNumber.updateValueAndValidity()
  }

  private preview(format: string | null, counter: number | undefined): string {
    if (!format) return ''
    return formatNumber(format, (counter ?? 0) + 1, new Date().getFullYear())
  }

  private patchForm(company: CompanyDto): void {
    this.form.patchValue({
      name:          company.name,
      legalForm:     company.legalForm,
      street:        company.street,
      zipCode:       company.zipCode,
      city:          company.city,
      country:       company.country,
      email:         company.email,
      phone:         company.phone,
      website:       company.website,
      companyNumber: company.companyNumber,
      vatNumber:     company.vatNumber,
      peppolId:      company.peppolId,
      iban:          company.iban,
      bic:           company.bic,
      defaultVatRate:            company.settings.defaultVatRate,
      paymentTermsDays:          company.settings.paymentTermsDays,
      paymentConditions:         company.settings.paymentConditions,
      invoiceNumberFormat:       company.settings.invoiceNumberFormat,
      quoteNumberFormat:         company.settings.quoteNumberFormat,
      invoiceCounterResetYearly: company.settings.invoiceCounterResetYearly,
      quoteCounterResetYearly:   company.settings.quoteCounterResetYearly,
    })
  }

  private buildInput(): SaveCompanyInput {
    const v = this.form.getRawValue()
    return {
      company: {
        name:          v.name!,
        legalForm:     v.legalForm || null,
        street:        v.street || null,
        zipCode:       v.zipCode || null,
        city:          v.city || null,
        country:       v.country || null,
        email:         v.email || null,
        phone:         v.phone || null,
        website:       v.website || null,
        companyNumber: v.companyNumber || null,
        vatNumber:     v.vatNumber || null,
        peppolId:      v.peppolId || null,
        iban:          v.iban || null,
        bic:           v.bic || null,
      },
      settings: {
        defaultVatRate:            v.defaultVatRate ?? undefined,
        paymentTermsDays:          v.paymentTermsDays ?? undefined,
        paymentConditions:         v.paymentConditions || null,
        invoiceNumberFormat:       v.invoiceNumberFormat!,
        quoteNumberFormat:         v.quoteNumberFormat!,
        invoiceCounterResetYearly: v.invoiceCounterResetYearly ?? undefined,
        quoteCounterResetYearly:   v.quoteCounterResetYearly ?? undefined,
      },
    }
  }
}
