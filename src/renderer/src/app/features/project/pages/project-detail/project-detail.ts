import { Component, OnInit, computed, inject, signal } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { LucideArrowLeft, LucideCheck, LucidePlus } from '@lucide/angular'
import { ProjectStatus, CreateProjectDto, UpdateProjectDto } from '@shared/dtos/project'
import { ProjectStore } from '@app/stores/project'
import { ClientStore } from '@app/stores/client/client-store'
import { CategoryStore } from '@app/stores/category'
import { Button, FormField, ConfirmDialog } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { displayClientName } from '../../../client/utils/client-display'
import { CategoryFormModal, CategoryFormValue } from '../../../category/components'
import { PROJECT_STATUSES, projectStatusKey } from '../../utils/project-status'

@Component({
  selector: 'app-project-detail',
  imports: [ReactiveFormsModule, Button, FormField, ConfirmDialog, CategoryFormModal, TranslatePipe, LucideArrowLeft, LucideCheck, LucidePlus],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  private readonly fb     = inject(FormBuilder)
  private readonly route  = inject(ActivatedRoute)
  private readonly router = inject(Router)
  readonly store      = inject(ProjectStore)
  readonly clients    = inject(ClientStore)
  readonly categories = inject(CategoryStore)

  readonly ButtonVariant = ButtonVariant
  readonly statuses      = PROJECT_STATUSES
  readonly statusKey     = projectStatusKey
  readonly displayName   = displayClientName

  readonly projectId           = signal<number | null>(null)
  readonly selectedCategoryIds = signal<number[]>([])
  readonly confirmOpen         = signal(false)
  readonly catModalOpen        = signal(false)
  readonly loading             = signal(false)

  readonly isEdit   = computed(() => this.projectId() !== null)
  readonly titleKey = computed(() => this.isEdit() ? 'project.editTitle' : 'project.createTitle')

  readonly form = this.fb.group({
    name:        ['', [Validators.required]],
    description: [''],
    status:      [ProjectStatus.PROSPECT as ProjectStatus, [Validators.required]],
    clientId:    [null as number | null, [Validators.required]],
    startDate:   [''],
    endDate:     [''],
    hourlyRate:  [null as number | null],
    dailyRate:   [null as number | null],
    budget:      [null as number | null],
  })

  get nameControl()        { return this.form.controls.name }
  get descriptionControl() { return this.form.controls.description }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.clients.load(), this.categories.load()])
    const idParam = this.route.snapshot.paramMap.get('id')
    if (idParam) {
      const id = Number(idParam)
      this.projectId.set(id)
      await this.loadProject(id)
    }
  }

  private async loadProject(id: number): Promise<void> {
    this.loading.set(true)
    const project = await this.store.getById(id)
    this.loading.set(false)
    if (!project) { this.router.navigate(['/projects']); return }
    this.form.patchValue({
      name:        project.name,
      description: project.description ?? '',
      status:      project.status,
      clientId:    project.clientId,
      startDate:   this.toDateInput(project.startDate),
      endDate:     this.toDateInput(project.endDate),
      hourlyRate:  project.hourlyRate,
      dailyRate:   project.dailyRate,
      budget:      project.budget,
    })
    this.selectedCategoryIds.set((project.categories ?? []).map(c => c.id))
  }

  isCategorySelected(id: number): boolean {
    return this.selectedCategoryIds().includes(id)
  }

  toggleCategory(id: number): void {
    this.selectedCategoryIds.update(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    )
  }

  chipBg(color: string): string {
    return `color-mix(in srgb, ${color} 20%, transparent)`
  }

  readonly selectedCount = computed(() => this.selectedCategoryIds().length)

  async createCategory(value: CategoryFormValue): Promise<void> {
    const created = await this.categories.add(value)
    if (!created) return
    this.selectedCategoryIds.update(ids => [...ids, created.id])
    this.catModalOpen.set(false)
  }

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    const v    = this.form.getRawValue()
    const desc = (v.description ?? '').trim()
    const id   = this.projectId()

    if (id !== null) {
      const payload: UpdateProjectDto = {
        id,
        name:        v.name!,
        description: desc || null,
        status:      v.status ?? ProjectStatus.PROSPECT,
        clientId:    v.clientId!,
        startDate:   v.startDate ? new Date(v.startDate) : null,
        endDate:     v.endDate ? new Date(v.endDate) : null,
        hourlyRate:  v.hourlyRate ?? null,
        dailyRate:   v.dailyRate ?? null,
        budget:      v.budget ?? null,
        categoryIds: this.selectedCategoryIds(),
      }
      const updated = await this.store.update(payload)
      if (updated) this.router.navigate(['/projects'])
    } else {
      const payload: CreateProjectDto = {
        name:        v.name!,
        description: desc || undefined,
        status:      v.status ?? ProjectStatus.PROSPECT,
        clientId:    v.clientId!,
        startDate:   v.startDate ? new Date(v.startDate) : undefined,
        endDate:     v.endDate ? new Date(v.endDate) : undefined,
        hourlyRate:  v.hourlyRate ?? undefined,
        dailyRate:   v.dailyRate ?? undefined,
        budget:      v.budget ?? undefined,
        categoryIds: this.selectedCategoryIds(),
      }
      const created = await this.store.add(payload)
      if (created) this.router.navigate(['/projects'])
    }
  }

  async confirmDelete(): Promise<void> {
    const id = this.projectId()
    if (id === null) return
    const ok = await this.store.remove(id)
    this.confirmOpen.set(false)
    if (ok) this.router.navigate(['/projects'])
  }

  cancel(): void {
    this.router.navigate(['/projects'])
  }

  private toDateInput(d: Date | string | null): string {
    if (!d) return ''
    return new Date(d).toISOString().slice(0, 10)
  }
}
