import { Directive, ElementRef, HostListener, inject } from '@angular/core'

@Directive({
  selector: '[appFocusTrap]',
})
export class FocusTrap {
  private readonly host = inject(ElementRef)

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return

    const root   = this.host.nativeElement as HTMLElement
    const target = e.target as Node | null
    if (!target || !root.contains(target)) return

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(el => el.offsetParent !== null)

    if (focusables.length === 0) return

    const first  = focusables[0]
    const last   = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (e.shiftKey && active === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
