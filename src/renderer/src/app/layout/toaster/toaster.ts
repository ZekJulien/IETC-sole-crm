import { Component, computed, inject } from '@angular/core'
import { ToastService } from '../../services/toast/toast.service'
import { PositionToast } from '../../enums'
import { Uuid } from '../../core/types'

@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
})
export class Toaster {
  private readonly toastService = inject(ToastService)

  readonly toasts = this.toastService.toasts

  readonly toastsByPosition = computed(() => ({
    [PositionToast.TOPLEFT]:     this.toasts().filter(t => t.position === PositionToast.TOPLEFT),
    [PositionToast.TOPCENTER]:   this.toasts().filter(t => t.position === PositionToast.TOPCENTER),
    [PositionToast.TOPRIGHT]:    this.toasts().filter(t => t.position === PositionToast.TOPRIGHT),
    [PositionToast.BOTTOMLEFT]:  this.toasts().filter(t => t.position === PositionToast.BOTTOMLEFT),
    [PositionToast.BOTTOMRIGHT]: this.toasts().filter(t => t.position === PositionToast.BOTTOMRIGHT),
  }))

  readonly Position = PositionToast

  remove(id: Uuid): void {
    this.toastService.remove(id)
  }

  pause(id: Uuid): void {
    this.toastService.pause(id)
  }

  resume(id: Uuid): void {
    this.toastService.resume(id)
  }
}
