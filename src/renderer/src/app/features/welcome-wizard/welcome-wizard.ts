import { Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { SaveCompanyInput } from '@shared/dtos/company'
import { CompanyStore } from '@app/stores/company/company-store'
import { SeedStore } from '@app/stores/seed/seed-store'
import { DashboardStore } from '@app/stores/dashboard'
import { WizardService } from '@app/services/wizard/wizard'
import { WizardWelcome } from './components/wizard-welcome/wizard-welcome'
import { WizardCompany } from './components/wizard-company/wizard-company'
import { WizardSeedChoice, SeedChoice } from './components/wizard-seed-choice/wizard-seed-choice'

@Component({
  selector: 'app-welcome-wizard',
  imports: [WizardWelcome, WizardCompany, WizardSeedChoice],
  templateUrl: './welcome-wizard.html',
  styleUrl: './welcome-wizard.css',
})
export class WelcomeWizard {
  readonly company = inject(CompanyStore)
  readonly seed    = inject(SeedStore)
  private readonly dashboard = inject(DashboardStore)
  private readonly wizard = inject(WizardService)
  private readonly router = inject(Router)

  readonly step = signal<number>(1)

  next(): void { this.step.set(2) }
  back(): void { this.step.set(this.step() - 1) }

  async choose(mode: SeedChoice): Promise<void> {
    if (mode === 'empty') { this.step.set(3); return }
    if (await this.seed.seedDemo()) await this.complete()
  }

  async saveCompany(input: SaveCompanyInput): Promise<void> {
    if (!await this.company.save(input)) return
    if (await this.seed.seedEmpty()) await this.complete()
  }

  private async complete(): Promise<void> {
    await this.company.load()
    await this.dashboard.load()
    this.wizard.finish()
    await this.router.navigateByUrl('/')
  }
}
