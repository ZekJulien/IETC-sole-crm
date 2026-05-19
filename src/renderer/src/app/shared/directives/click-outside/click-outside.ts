import { Directive, ElementRef, HostListener, inject, output } from '@angular/core'

@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutside {
  private readonly host = inject(ElementRef)
  readonly clickOutside = output<PointerEvent>()

  @HostListener('document:pointerdown', ['$event'])
  onDocPointerDown(e: PointerEvent): void {
    const target = e.target as Node | null
    const root   = this.host.nativeElement as HTMLElement
    if (target && !root.contains(target)) {
      this.clickOutside.emit(e)
    }
  }
}
