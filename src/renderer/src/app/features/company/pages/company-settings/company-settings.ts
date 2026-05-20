import { Component, OnInit, inject } from '@angular/core'
import { LucideBuilding2 } from '@lucide/angular'
import { SaveCompanyInput } from '@shared/dtos/company'
import { CompanyStore } from '@app/stores/company/company-store'
import { Button } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CompanyForm } from '../../components'

@Component({
  selector: 'app-company-settings',
  imports: [CompanyForm, Button, TranslatePipe, LucideBuilding2],
  templateUrl: './company-settings.html',
  styleUrl: './company-settings.css',
})
export class CompanySettings implements OnInit {
  readonly store = inject(CompanyStore)
  readonly ButtonVariant = ButtonVariant

  async ngOnInit(): Promise<void> {
    await this.store.load()
  }

  onSubmit(input: SaveCompanyInput): void {
    this.store.save(input)
  }
}
