import { getDbContext } from '../../core'
import { CompanyRepository } from '../../repositories/company/company.repository'

let _instance: CompanyRepository | null = null

export function getCompanyRepository(): CompanyRepository {
  if (!_instance) _instance = new CompanyRepository(getDbContext())
  return _instance
}
