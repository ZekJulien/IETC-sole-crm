import { Component, computed, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { toSignal } from '@angular/core/rxjs-interop'
import { CategoryDto } from '@shared/dtos/category'
import { Button, FormField, Modal, ColorPicker } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CATEGORY_PALETTE } from '../../utils/category-colors'

export interface CategoryFormValue {
  name:  string
  color: string
}

@Component({
  selector: 'app-category-form-modal',
  imports: [ReactiveFormsModule, FormField, Button, Modal, ColorPicker, TranslatePipe],
  templateUrl: './category-form-modal.html',
  styleUrl: './category-form-modal.css',
})
export class CategoryFormModal {
  private readonly fb = inject(FormBuilder)

  readonly open     = input<boolean>(false)
  readonly category = input<CategoryDto | null>(null)
  readonly saving   = input<boolean>(false)

  readonly submitted = output<CategoryFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant
  readonly palette = CATEGORY_PALETTE

  readonly form = this.fb.nonNullable.group({
    name:  ['', [Validators.required]],
    color: [CATEGORY_PALETTE[0], [Validators.required]],
  })

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() })

  readonly isEdit       = computed(() => !!this.category())
  readonly titleKey     = computed(() => this.isEdit() ? 'category.modal.editTitle' : 'category.modal.createTitle')
  readonly currentColor = computed(() => this.value().color ?? CATEGORY_PALETTE[0])
  readonly currentName  = computed(() => this.value().name ?? '')
  readonly chipBg       = computed(() => `color-mix(in srgb, ${this.currentColor()} 18%, transparent)`)

  get nameControl() { return this.form.controls.name }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const cat = this.category()
      this.form.reset({
        name:  cat?.name  ?? '',
        color: cat?.color ?? CATEGORY_PALETTE[0],
      })
    })
  }

  selectColor(color: string): void {
    this.form.controls.color.setValue(color)
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }
}
