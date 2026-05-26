import { VatRateService } from '../../services/vat-rate/vat-rate.service'
import { getVatRateRepository } from './vat-rate.repository.dependency'

let _instance: VatRateService | null = null

export function getVatRateService(): VatRateService {
  if (!_instance) _instance = new VatRateService(getVatRateRepository())
  return _instance
}
