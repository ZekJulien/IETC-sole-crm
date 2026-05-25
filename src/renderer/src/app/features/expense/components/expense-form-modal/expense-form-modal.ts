import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms'
import { LucidePaperclip, LucidePlus, LucideX, LucideFileText, LucideExternalLink } from '@lucide/angular'
import { ExpenseDto } from '@shared/dtos/expense'
import { ExpenseCategoryDto } from '@shared/dtos/expense-category'
import { ProjectDto } from '@shared/dtos/project'
import { Button, FormField, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { ExpenseService } from '@app/services/expense/expense'
import { ExpenseCategoryStore } from '@app/stores/expense-category'
import { ExpenseCategoryFormModal, ExpenseCategoryFormValue } from '../../../expense-category/components'

interface FormReceipt {
  id:   number | null
  name: string
  path: string
}

export interface ExpenseFormValue {
  label:             string
  amount:            number
  date:              string
  expenseCategoryId: number
  projectId:         number | null
  notes:             string
  receipts:          { id: number | null; path: string }[]
}

@Component({
  selector: 'app-expense-form-modal',
  imports: [
    ReactiveFormsModule, FormField, Button, Modal, ExpenseCategoryFormModal, TranslatePipe,
    LucidePaperclip, LucidePlus, LucideX, LucideFileText, LucideExternalLink,
  ],
  templateUrl: './expense-form-modal.html',
  styleUrl: './expense-form-modal.css',
})
export class ExpenseFormModal {
  private readonly fb            = inject(FormBuilder)
  private readonly expenseSvc    = inject(ExpenseService)
  readonly categoryStore = inject(ExpenseCategoryStore)

  readonly open       = input<boolean>(false)
  readonly entry      = input<ExpenseDto | null>(null)
  readonly categories = input<ExpenseCategoryDto[]>([])
  readonly projects   = input<ProjectDto[]>([])
  readonly saving     = input<boolean>(false)

  readonly submitted = output<ExpenseFormValue>()
  readonly cancelled = output<void>()
  readonly deleted   = output<void>()

  readonly ButtonVariant = ButtonVariant

  readonly receipts       = signal<FormReceipt[]>([])
  readonly pickingReceipt = signal<boolean>(false)
  readonly catModalOpen   = signal<boolean>(false)

  readonly form = this.fb.nonNullable.group({
    label:             ['', [Validators.required]],
    amount:            [null as number | null, [Validators.required, Validators.min(0.01)]],
    expenseCategoryId: [null as number | null, [Validators.required]],
    projectId:         [null as number | null],
    date:              [''],
    notes:             [''],
  })

  readonly isEdit   = computed(() => !!this.entry())
  readonly titleKey = computed(() => this.isEdit() ? 'expense.modal.editTitle' : 'expense.modal.createTitle')

  get notesControl() { return this.form.controls.notes }

  constructor() {
    effect(() => {
      if (!this.open()) return
      const e = this.entry()
      this.form.reset({
        label:             e?.label ?? '',
        amount:            e?.amount ?? null,
        expenseCategoryId: e?.expenseCategoryId ?? this.categories()[0]?.id ?? null,
        projectId:         e?.projectId ?? null,
        date:              this.toDateInput(e?.date ?? new Date()),
        notes:             e?.notes ?? '',
      })
      this.receipts.set((e?.receipts ?? []).map(r => ({ id: r.id, name: r.name, path: r.path })))
    })
  }

  async onAddReceipt(): Promise<void> {
    this.pickingReceipt.set(true)
    try {
      const path = await this.expenseSvc.pickReceipt()
      if (path) this.receipts.update(list => [...list, { id: null, name: this.fileName(path), path }])
    } finally {
      this.pickingReceipt.set(false)
    }
  }

  openReceipt(receipt: FormReceipt): void {
    this.expenseSvc.openReceipt(receipt.path)
  }

  removeReceipt(index: number): void {
    this.receipts.update(list => list.filter((_, i) => i !== index))
  }

  async createCategory(value: ExpenseCategoryFormValue): Promise<void> {
    const created = await this.categoryStore.add(value)
    if (!created) return
    this.form.controls.expenseCategoryId.setValue(created.id)
    this.catModalOpen.set(false)
  }

  onClose(): void {
    if (this.catModalOpen()) return
    this.cancelled.emit()
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const raw = this.form.getRawValue()
    if (raw.amount == null || raw.expenseCategoryId == null) { this.form.markAllAsTouched(); return }
    this.submitted.emit({
      label:             raw.label.trim(),
      amount:            raw.amount,
      date:              raw.date,
      expenseCategoryId: raw.expenseCategoryId,
      projectId:         raw.projectId,
      notes:             raw.notes,
      receipts:          this.receipts().map(r => ({ id: r.id, path: r.path })),
    })
  }

  private fileName(path: string): string {
    return path.split(/[\\/]/).pop() ?? path
  }

  private toDateInput(d: Date | string): string {
    const date = new Date(d)
    const offset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - offset).toISOString().slice(0, 10)
  }
}
