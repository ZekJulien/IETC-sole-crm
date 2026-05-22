import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { toSignal } from '@angular/core/rxjs-interop'
import { ExpenseCategoryDto } from '@shared/dtos/expense-category'
import { Button, FormField, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { EXPENSE_CATEGORY_PALETTE } from '../../utils/expense-category-colors'

export interface ExpenseCategoryFormValue {
  name:       string
  color:      string
  deductible: boolean
}

@Component({
  selector: 'app-expense-category-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, TranslatePipe],
  templateUrl: './expense-category-form-modal.html',
  styleUrl: './expense-category-form-modal.css',
})
export class ExpenseCategoryFormModal {
  private readonly fb = inject(FormBuilder)

  readonly open     = input<boolean>(false)
  readonly category = input<ExpenseCategoryDto | null>(null)
  readonly saving   = input<boolean>(false)

  readonly submitted = output<ExpenseCategoryFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant
  readonly palette = EXPENSE_CATEGORY_PALETTE

  readonly form = this.fb.nonNullable.group({
    name:       ['', [Validators.required]],
    color:      [EXPENSE_CATEGORY_PALETTE[0], [Validators.required]],
    deductible: [true],
  })

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() })

  readonly isEdit          = computed(() => !!this.category())
  readonly titleKey        = computed(() => this.isEdit() ? 'expenseCategory.modal.editTitle' : 'expenseCategory.modal.createTitle')
  readonly currentColor    = computed(() => this.value().color ?? EXPENSE_CATEGORY_PALETTE[0])
  readonly currentName     = computed(() => this.value().name ?? '')
  readonly isDeductible    = computed(() => this.value().deductible ?? true)
  readonly chipBg          = computed(() => `color-mix(in srgb, ${this.currentColor()} 18%, transparent)`)

  get nameControl() { return this.form.controls.name }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const cat = this.category()
      this.form.reset({
        name:       cat?.name       ?? '',
        color:      cat?.color      ?? EXPENSE_CATEGORY_PALETTE[0],
        deductible: cat?.deductible ?? true,
      })
    })
  }

  selectColor(color: string): void {
    this.form.controls.color.setValue(color)
  }

  toggleDeductible(): void {
    this.form.controls.deductible.setValue(!this.form.controls.deductible.value)
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }
}
