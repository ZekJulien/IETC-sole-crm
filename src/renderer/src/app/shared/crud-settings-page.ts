import { signal } from '@angular/core'

export abstract class CrudSettingsPage<TDto extends { id: number }> {
  abstract readonly store: { remove(id: number): Promise<unknown> }

  readonly modalOpen   = signal(false)
  readonly editing     = signal<TDto | null>(null)
  readonly confirmOpen = signal(false)

  openCreate(): void {
    this.editing.set(null)
    this.modalOpen.set(true)
  }

  openEdit(item: TDto): void {
    this.editing.set(item)
    this.modalOpen.set(true)
  }

  closeModal(): void {
    this.modalOpen.set(false)
    this.editing.set(null)
  }

  async confirmDelete(): Promise<void> {
    const editing = this.editing()
    if (editing) await this.store.remove(editing.id)
    this.confirmOpen.set(false)
    this.closeModal()
  }
}
