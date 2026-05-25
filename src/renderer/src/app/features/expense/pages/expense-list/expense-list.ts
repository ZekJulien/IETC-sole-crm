import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { LucideReceiptText, LucidePlus } from '@lucide/angular'
import { ExpenseDto, ExpenseFilter } from '@shared/dtos/expense'
import { ExpenseStore } from '@app/stores/expense'
import { ExpenseCategoryStore } from '@app/stores/expense-category'
import { ProjectStore } from '@app/stores/project'
import { Button, DataTable, ConfirmDialog } from '@app/components'
import { TableColumn, TableTag } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { formatCurrency } from '@app/utils'
import { ExpenseFormModal, ExpenseFormValue } from '../../components/expense-form-modal/expense-form-modal'

interface ExpenseRow {
  id:          number
  date:        Date
  label:       string
  category:    TableTag[]
  projectName: string
  amount:      number
  deductible:  boolean
}

@Component({
  selector: 'app-expense-list',
  imports: [DataTable, Button, ConfirmDialog, ExpenseFormModal, TranslatePipe, LucideReceiptText, LucidePlus],
  templateUrl: './expense-list.html',
  styleUrl: './expense-list.css',
})
export class ExpenseList implements OnInit {
  readonly store      = inject(ExpenseStore)
  readonly categories = inject(ExpenseCategoryStore)
  readonly projects   = inject(ProjectStore)

  readonly ButtonVariant  = ButtonVariant
  readonly formatCurrency = formatCurrency
  readonly currentYear    = new Date().getFullYear()

  readonly categoryFilter = signal<number | null>(null)
  readonly fromDate  = signal<string>('')
  readonly toDate    = signal<string>('')
  readonly modalOpen = signal(false)
  readonly editing   = signal<ExpenseDto | null>(null)
  readonly confirmId = signal<number | null>(null)

  readonly rows = computed<ExpenseRow[]>(() =>
    this.store.expenses().map(e => ({
      id:          e.id,
      date:        e.date,
      label:       e.label,
      category:    [{ label: e.expenseCategoryName, color: e.expenseCategoryColor }],
      projectName: e.projectName ?? '—',
      amount:      e.amount,
      deductible:  e.deductible,
    }))
  )

  readonly columns: TableColumn<ExpenseRow>[] = [
    { key: 'date',        labelKey: 'expense.dateLabel',     type: 'date', sortable: true, width: '130px' },
    { key: 'label',       labelKey: 'expense.labelField',    sortable: true },
    { key: 'category',    labelKey: 'expense.categoryLabel', type: 'tags' },
    { key: 'projectName', labelKey: 'expense.projectLabel' },
    { key: 'amount',      labelKey: 'expense.amount',        type: 'currency', sortable: true, width: '130px' },
    { key: 'deductible',  labelKey: 'expense.deductible',    type: 'boolean', width: '120px' },
  ]

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categories.load(),
      this.projects.load(),
    ])
    await this.store.load()
  }

  onCategoryChange(value: string): void {
    this.categoryFilter.set(value ? Number(value) : null)
    this.applyFilter()
  }

  onFrom(value: string): void { this.fromDate.set(value); this.applyFilter() }
  onTo(value: string): void   { this.toDate.set(value);   this.applyFilter() }

  openCreate(): void { this.editing.set(null); this.modalOpen.set(true) }

  onRowClick(row: ExpenseRow): void {
    this.editing.set(this.store.expenses().find(e => e.id === row.id) ?? null)
    this.modalOpen.set(true)
  }

  requestDelete(): void {
    const e = this.editing()
    if (!e) return
    this.modalOpen.set(false)
    this.confirmId.set(e.id)
  }

  async submit(value: ExpenseFormValue): Promise<void> {
    const date = value.date ? this.parseDate(value.date) : undefined
    const notes = value.notes.trim() || null
    const editing = this.editing()
    if (editing) {
      const ok = await this.store.update({
        id:                editing.id,
        label:             value.label,
        amount:            value.amount,
        date,
        expenseCategoryId: value.expenseCategoryId,
        projectId:         value.projectId,
        notes,
        keepReceiptIds:    value.receipts.filter(r => r.id !== null).map(r => r.id!),
        newReceiptPaths:   value.receipts.filter(r => r.id === null).map(r => r.path),
      })
      if (ok) this.modalOpen.set(false)
    } else {
      const ok = await this.store.add({
        label:             value.label,
        amount:            value.amount,
        date,
        expenseCategoryId: value.expenseCategoryId,
        projectId:         value.projectId,
        notes,
        receiptPaths:      value.receipts.map(r => r.path),
      })
      if (ok) this.modalOpen.set(false)
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.confirmId()
    if (id === null) return
    await this.store.remove(id)
    this.confirmId.set(null)
  }

  private applyFilter(): void {
    const filter: ExpenseFilter = {
      expenseCategoryId: this.categoryFilter() ?? undefined,
      from: this.fromDate() ? this.parseDate(this.fromDate()) : undefined,
      to:   this.toDate()   ? this.parseDate(this.toDate())   : undefined,
    }
    this.store.load(filter)
  }

  private parseDate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
}
