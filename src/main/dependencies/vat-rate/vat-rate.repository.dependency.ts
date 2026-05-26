import { getDbContext } from '../../core'
import { VatRateRepository } from '../../repositories/vat-rate/vat-rate.repository'

let _instance: VatRateRepository | null = null

export function getVatRateRepository(): VatRateRepository {
  if (!_instance) _instance = new VatRateRepository(getDbContext())
  return _instance
}
