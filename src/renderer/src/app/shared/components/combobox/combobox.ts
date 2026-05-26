import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core'

let nextId = 0

@Component({
  selector: 'app-combobox',
  templateUrl: './combobox.html',
  styleUrl: './combobox.css',
})
export class Combobox {
  readonly value       = input<string>('')
  readonly suggestions = input<string[]>([])
  readonly placeholder = input<string>('')

  readonly valueChange = output<string>()
  readonly picked      = output<string>()

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input')
  private readonly menuRef  = viewChild<ElementRef<HTMLElement>>('menu')

  readonly open        = signal(false)
  readonly activeIndex = signal(-1)
  private readonly query = signal('')

  private readonly uid = `combobox-${nextId++}`
  readonly listboxId = `${this.uid}-list`
  optionId(index: number): string { return `${this.uid}-opt-${index}` }

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase()
    const all = this.suggestions()
    return (q ? all.filter(s => s.toLowerCase().includes(q)) : all).slice(0, 8)
  })

  readonly activeId = computed(() => {
    const i = this.activeIndex()
    return i >= 0 && i < this.filtered().length ? this.optionId(i) : null
  })

  onInput(value: string): void {
    this.query.set(value)
    this.open.set(true)
    this.activeIndex.set(-1)
    this.valueChange.emit(value)
  }

  onFocus(): void {
    this.query.set('')
    this.activeIndex.set(-1)
    this.open.set(true)
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        this.open.set(true)
        this.move(1)
        return
      case 'ArrowUp':
        event.preventDefault()
        this.move(-1)
        return
      case 'Enter': {
        event.preventDefault()
        this.commitActive()
        this.focusNext()
        return
      }
      case 'Tab':
        this.commitActive()
        return
      case 'Escape':
        if (this.open()) { event.preventDefault(); this.close() }
        return
    }
  }

  pick(option: string): void {
    this.close()
    this.valueChange.emit(option)
    this.picked.emit(option)
  }

  close(): void {
    this.open.set(false)
    this.activeIndex.set(-1)
  }

  private move(delta: number): void {
    const max = this.filtered().length - 1
    if (max < 0) return
    const next = Math.min(Math.max(this.activeIndex() + delta, 0), max)
    this.activeIndex.set(next)
    queueMicrotask(() => this.scrollActiveIntoView())
  }

  private commitActive(): void {
    const i = this.activeIndex()
    const options = this.filtered()
    if (this.open() && i >= 0 && i < options.length) this.pick(options[i])
    else this.close()
  }

  private scrollActiveIntoView(): void {
    const li = this.menuRef()?.nativeElement.children[this.activeIndex()] as HTMLElement | undefined
    li?.scrollIntoView({ block: 'nearest' })
  }

  private focusNext(): void {
    const input = this.inputRef()?.nativeElement
    if (!input) return
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>('input, select, textarea, button, [tabindex]'),
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null)
    const idx = focusables.indexOf(input)
    if (idx >= 0) focusables[idx + 1]?.focus()
  }
}
