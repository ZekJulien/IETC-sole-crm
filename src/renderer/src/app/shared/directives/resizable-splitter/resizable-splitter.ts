import { Directive, ElementRef, HostListener, inject, input, output } from '@angular/core'

@Directive({
  selector: '[appResizableSplitter]',
})
export class ResizableSplitter {
  private readonly host = inject(ElementRef)

  readonly resizableMin = input<number>(200)
  readonly resizableMax = input<number>(500)

  readonly widthChange    = output<number>()
  readonly draggingChange = output<boolean>()

  private dragging = false

  @HostListener('pointerdown', ['$event'])
  onPointerDown(e: PointerEvent): void {
    e.preventDefault()
    this.dragging = true
    this.draggingChange.emit(true)
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(e: PointerEvent): void {
    if (!this.dragging) return
    e.preventDefault()
    const parent = (this.host.nativeElement as HTMLElement).parentElement
    if (!parent) return
    const left = parent.getBoundingClientRect().left
    const next = Math.min(this.resizableMax(), Math.max(this.resizableMin(), e.clientX - left))
    this.widthChange.emit(next)
  }

  @HostListener('window:pointerup')
  onPointerUp(): void {
    if (!this.dragging) return
    this.dragging = false
    this.draggingChange.emit(false)
  }
}
