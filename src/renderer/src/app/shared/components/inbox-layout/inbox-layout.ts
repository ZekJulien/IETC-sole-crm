import { Component, signal, effect, input, HostListener } from '@angular/core'

const STORAGE_KEY = 'inbox-layout:list-width'
const MIN_WIDTH   = 200
const MAX_WIDTH   = 500
const DEFAULT     = 280

@Component({
  selector: 'app-inbox-layout',
  templateUrl: './inbox-layout.html',
  styleUrl: './inbox-layout.css',
})
export class InboxLayout {
  readonly hasDetail = input<boolean>(false)

  readonly listWidth = signal<number>(this.readStored())
  private dragging = false

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, String(this.listWidth())))
  }

  startDrag(): void { this.dragging = true }

  @HostListener('window:pointermove', ['$event'])
  onMove(e: PointerEvent): void {
    if (!this.dragging) return
    e.preventDefault()
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX - (e.currentTarget as Window).innerWidth * 0 - this.hostLeft()))
    this.listWidth.set(next)
  }

  @HostListener('window:pointerup')
  onUp(): void { this.dragging = false }

  private hostLeft(): number {
    return (document.querySelector('app-inbox-layout') as HTMLElement | null)?.getBoundingClientRect().left ?? 0
  }

  private readStored(): number {
    const raw = Number(localStorage.getItem(STORAGE_KEY))
    return Number.isFinite(raw) && raw >= MIN_WIDTH && raw <= MAX_WIDTH ? raw : DEFAULT
  }
}
