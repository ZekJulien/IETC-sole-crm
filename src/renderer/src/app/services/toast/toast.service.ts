import { Injectable, signal } from '@angular/core';
import { Toast, TimerState } from '../../models';
import { PositionToast, TypeToast } from '../../enums';
import { Uuid } from '../../core/types';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private readonly timers = new Map<Uuid, TimerState>();

  private _show(message: string, type: TypeToast, options?: Partial<Toast>): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type,
      position: PositionToast.TOPRIGHT,
      autoCloseTime: 3000,
      canClose: true,
      pauseOnHover: true,
      ...options,
    }
    this._toasts.update(v => [...v, toast]);
    if (toast.autoCloseTime > 0) {
      this.startTimer(toast.id, toast.autoCloseTime);
    }
  }

  private startTimer(id: Uuid, duration: number): void {
    const timeoutId = window.setTimeout(() => this.remove(id), duration);
    this.timers.set(id, { timeoutId, startedAt: Date.now(), remaining: duration });
  }

  pause(id: Uuid): void {
    const t = this.timers.get(id);
    if (!t || t.timeoutId === 0) return;    
    clearTimeout(t.timeoutId);
    const elapsed = Date.now() - t.startedAt;
    this.timers.set(id, { ...t, timeoutId: 0, remaining: Math.max(0, t.remaining - elapsed) });
  }

  resume(id: Uuid): void {
    const t = this.timers.get(id);
    if (!t || t.timeoutId !== 0) return;    
    this.startTimer(id, t.remaining);
  }

  remove(id: Uuid): void {
    const t = this.timers.get(id);
    if (t?.timeoutId) clearTimeout(t.timeoutId);
    this.timers.delete(id);
    this._toasts.update(v => v.filter(toast => toast.id !== id));
  }

  success(message: string, options?: Partial<Toast>): void { this._show(message, TypeToast.SUCCESS, options) }
  info   (message: string, options?: Partial<Toast>): void { this._show(message, TypeToast.INFO,    options) }
  warning(message: string, options?: Partial<Toast>): void { this._show(message, TypeToast.WARNING, options) }
  error  (message: string, options?: Partial<Toast>): void { this._show(message, TypeToast.ERROR,   options) }
}
