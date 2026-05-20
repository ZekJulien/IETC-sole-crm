import { CompanySettingsService } from '../../services/company/company-settings.service'
import { getCompanySettingsRepository } from './company-settings.repository.dependency'

let _instance: CompanySettingsService | null = null

export function getCompanySettingsService(): CompanySettingsService {
  if (!_instance) _instance = new CompanySettingsService(getCompanySettingsRepository())
  return _instance
}
