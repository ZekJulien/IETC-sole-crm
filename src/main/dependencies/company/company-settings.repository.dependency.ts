import { getDbContext } from '../../core'
import { CompanySettingsRepository } from '../../repositories/company/company-settings.repository'

let _instance: CompanySettingsRepository | null = null

export function getCompanySettingsRepository(): CompanySettingsRepository {
  if (!_instance) _instance = new CompanySettingsRepository(getDbContext())
  return _instance
}
