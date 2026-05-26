import { Component, input, output } from '@angular/core'
import { CompanyDto, SaveCompanyInput } from '@shared/dtos/company'
import { Button } from '@app/components'
import { TranslatePipe } from '@app/pipes'
import { ButtonVariant } from '@app/enums'
import { CompanyForm } from '../../../company/components'

@Component({
  selector: 'app-wizard-company',
  imports: [CompanyForm, Button, TranslatePipe],
  templateUrl: './wizard-company.html',
  styleUrl: './wizard-company.css',
})
export class WizardCompany {
  readonly company   = input<CompanyDto | null>(null)
  readonly saving    = input<boolean>(false)
  readonly submitted = output<SaveCompanyInput>()
  readonly back      = output<void>()
  readonly ButtonVariant = ButtonVariant
}
