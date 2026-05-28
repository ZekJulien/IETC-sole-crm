import { Component, DestroyRef, ElementRef, HostListener, effect, inject, input, output, viewChild } from '@angular/core'
import { TranslatePipe } from '../../pipes/translate-pipe'

const modalStack: Modal[] = []

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

@Component({
  selector: 'app-modal',
  imports: [TranslatePipe],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  readonly open   = input<boolean>(false)
  readonly title  = input<string | null>(null)
  readonly width  = input<string>('420px')
  readonly closed = output<void>()

  private readonly dialog = viewChild<ElementRef<HTMLElement>>('dialog')
  private previouslyFocused: HTMLElement | null = null

  constructor() {
    effect(() => {
      const i = modalStack.indexOf(this)
      if (this.open()) {
        if (i === -1) modalStack.push(this)
        this.previouslyFocused = document.activeElement as HTMLElement
        setTimeout(() => this.focusFirst())
      } else {
        if (i !== -1) modalStack.splice(i, 1)
        this.previouslyFocused?.focus?.()
        this.previouslyFocused = null
      }
    })
    inject(DestroyRef).onDestroy(() => {
      const i = modalStack.indexOf(this)
      if (i !== -1) modalStack.splice(i, 1)
    })
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isTop()) this.closed.emit()
  }

  @HostListener('document:keydown.tab', ['$event'])
  onTab(event: Event): void { this.trap(event, false) }

  @HostListener('document:keydown.shift.tab', ['$event'])
  onShiftTab(event: Event): void { this.trap(event, true) }

  private isTop(): boolean {
    return this.open() && modalStack[modalStack.length - 1] === this
  }

  private focusables(): HTMLElement[] {
    const el = this.dialog()?.nativeElement
    if (!el) return []
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(node => node.offsetParent !== null || node === document.activeElement)
  }

  private focusFirst(): void {
    const items = this.focusables()
    ;(items[0] ?? this.dialog()?.nativeElement)?.focus()
  }

  private trap(event: Event, shift: boolean): void {
    if (!this.isTop()) return
    const dialog = this.dialog()?.nativeElement
    if (!dialog) return
    const items = this.focusables()
    if (items.length === 0) { event.preventDefault(); dialog.focus(); return }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (shift) {
      if (active === first || !dialog.contains(active)) { event.preventDefault(); last.focus() }
    } else {
      if (active === last || !dialog.contains(active)) { event.preventDefault(); first.focus() }
    }
  }
}
