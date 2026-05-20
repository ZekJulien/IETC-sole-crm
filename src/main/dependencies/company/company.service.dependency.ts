import { CompanyService } from '../../services/company/company.service'
import { getCompanyRepository } from './company.repository.dependency'
import { getCompanySettingsService } from './company-settings.service.dependency'

let _instance: CompanyService | null = null

export function getCompanyService(): CompanyService {
  if (!_instance) _instance = new CompanyService(getCompanyRepository(), getCompanySettingsService())
  return _instance
}
