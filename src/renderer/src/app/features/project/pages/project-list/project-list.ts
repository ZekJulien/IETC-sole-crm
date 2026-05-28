import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { LucidePlus, LucideFolderKanban } from '@lucide/angular'
import { ProjectStatus } from '@shared/dtos/project'
import { ProjectStore } from '@app/stores/project'
import { ClientStore } from '@app/stores/client/client-store'
import { CategoryStore } from '@app/stores/category'
import { Button, SearchBar, DataTable, PageHeader } from '@app/components'
import { TableColumn, TableTag } from '@app/interfaces'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { displayClientName } from '../../../client/utils/client-display'
import { PROJECT_STATUSES, projectStatusKey } from '../../utils/project-status'

interface ProjectRow {
  id:         number
  name:       string
  clientName: string
  status:     ProjectStatus
  categories: TableTag[]
  startDate:  Date | null
  budget:     number | null
}

@Component({
  selector: 'app-project-list',
  imports: [SearchBar, DataTable, Button, PageHeader, TranslatePipe, LucidePlus],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit {
  private readonly router = inject(Router)
  readonly store      = inject(ProjectStore)
  readonly clients    = inject(ClientStore)
  readonly categories = inject(CategoryStore)

  readonly headerIcon    = LucideFolderKanban
  readonly ButtonVariant = ButtonVariant
  readonly statuses      = PROJECT_STATUSES
  readonly statusKey     = projectStatusKey

  readonly searchTerm     = signal<string>('')
  readonly statusFilter   = signal<ProjectStatus | ''>('')
  readonly clientFilter   = signal<number | null>(null)
  readonly categoryFilter = signal<number | null>(null)

  readonly rows = computed<ProjectRow[]>(() =>
    this.store.projects().map(p => ({
      id:         p.id,
      name:       p.name,
      clientName: p.client ? displayClientName(p.client) : '—',
      status:     p.status,
      categories: (p.categories ?? []).map(c => ({ label: c.name, color: c.color })),
      startDate:  p.startDate,
      budget:     p.budget,
    }))
  )

  readonly columns: TableColumn<ProjectRow>[] = [
    { key: 'name',       labelKey: 'project.name',        sortable: true },
    { key: 'clientName', labelKey: 'project.client',      sortable: true },
    { key: 'status',     labelKey: 'project.statusLabel', type: 'badge', badgeI18nPrefix: 'project.status.', width: '150px' },
    { key: 'categories', labelKey: 'project.categories',  type: 'tags' },
    { key: 'startDate',  labelKey: 'project.startDate',   type: 'date', sortable: true, width: '130px' },
    { key: 'budget',     labelKey: 'project.budget',      width: '120px' },
  ]

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.store.load(),
      this.clients.load(),
      this.categories.load(),
    ])
  }

  onSearch(term: string): void {
    this.searchTerm.set(term)
    this.reload()
  }

  onStatusChange(value: string): void {
    this.statusFilter.set(value as ProjectStatus | '')
    this.reload()
  }

  onClientChange(value: string): void {
    this.clientFilter.set(value ? Number(value) : null)
    this.reload()
  }

  onCategoryChange(value: string): void {
    this.categoryFilter.set(value ? Number(value) : null)
    this.reload()
  }

  openCreate(): void {
    this.router.navigate(['/projects/new'])
  }

  onRowClick(row: ProjectRow): void {
    this.router.navigate(['/projects', row.id])
  }

  private reload(): void {
    const search = this.searchTerm().trim()
    this.store.load({ where: this.buildWhere(), search: search || undefined })
  }

  private buildWhere(): Record<string, unknown> | undefined {
    const where: Record<string, unknown> = {}
    const status = this.statusFilter()
    if (status) where['status'] = status
    const clientId = this.clientFilter()
    if (clientId) where['clientId'] = clientId
    const categoryId = this.categoryFilter()
    if (categoryId) where['categories'] = { some: { categoryId } }
    return Object.keys(where).length ? where : undefined
  }
}
