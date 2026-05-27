import { Component, effect, inject, input, output } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { SavePomodoroSettingsDto } from '@shared/dtos/company'
import { Button, Modal } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'

@Component({
  selector: 'app-pomodoro-settings-modal',
  imports: [ReactiveFormsModule, Button, Modal, TranslatePipe],
  templateUrl: './pomodoro-settings-modal.html',
  styleUrl: './pomodoro-settings-modal.css',
})
export class PomodoroSettingsModal {
  private readonly fb = inject(FormBuilder)

  readonly open    = input<boolean>(false)
  readonly initial = input<SavePomodoroSettingsDto | null>(null)
  readonly saving  = input<boolean>(false)

  readonly submitted = output<SavePomodoroSettingsDto>()
  readonly cancelled = output<void>()

  readonly ButtonVariant = ButtonVariant

  readonly form = this.fb.nonNullable.group({
    workMinutes:       [25, [Validators.required, Validators.min(1), Validators.max(180)]],
    shortBreakMinutes: [5,  [Validators.required, Validators.min(1), Validators.max(60)]],
    longBreakMinutes:  [15, [Validators.required, Validators.min(1), Validators.max(120)]],
    longBreakInterval: [4,  [Validators.required, Validators.min(2), Validators.max(12)]],
  })

  constructor() {
    effect(() => {
      if (!this.open()) return
      this.form.reset(this.initial() ?? {
        workMinutes:       25,
        shortBreakMinutes: 5,
        longBreakMinutes:  15,
        longBreakInterval: 4,
      })
    })
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return }
    this.submitted.emit(this.form.getRawValue())
  }
}
