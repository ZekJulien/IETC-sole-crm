import { Component, OnInit, inject, signal } from '@angular/core'
import { LucideBuilding2 } from '@lucide/angular'
import { SaveCompanyInput } from '@shared/dtos/company'
import { CompanyStore } from '@app/stores/company/company-store'
import { SeedStore } from '@app/stores/seed/seed-store'
import { WizardService } from '@app/services/wizard/wizard'
import { Button, ConfirmDialog } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CompanyForm } from '../../components'
import { SettingsHeader } from '../../../settings/settings-header/settings-header'

@Component({
  selector: 'app-company-settings',
  imports: [CompanyForm, Button, ConfirmDialog, TranslatePipe, SettingsHeader],
  templateUrl: './company-settings.html',
  styleUrl: './company-settings.css',
})
export class CompanySettings implements OnInit {
  readonly store  = inject(CompanyStore)
  readonly seed   = inject(SeedStore)
  private readonly wizard = inject(WizardService)
  readonly ButtonVariant = ButtonVariant
  readonly headerIcon = LucideBuilding2
  readonly resetConfirmOpen = signal<boolean>(false)

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  onSubmit(input: SaveCompanyInput): void {
    this.store.save(input)
  }

  async confirmReset(): Promise<void> {
    this.resetConfirmOpen.set(false)
    const ok = await this.seed.reset()
    if (!ok) return
    await this.store.load()
    this.wizard.start()
  }
}
