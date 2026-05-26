import { VatRate } from '@db/client'
import { VatRateRepository } from '../../repositories/vat-rate/vat-rate.repository'
import { BaseService } from '../base.service'
import { FindManyArgs, PaginatedResult } from '@shared/types'
import { VatRateDto, CreateVatRateDto, UpdateVatRateDto } from '@shared/dtos/vat-rate'

export class VatRateService extends BaseService<VatRate, VatRateDto> {
  constructor(private readonly repo: VatRateRepository) { super() }

  async get(args?: FindManyArgs): Promise<PaginatedResult<VatRateDto>> {
    return this.mapMany(await this.repo.findMany(args))
  }

  async add(data: CreateVatRateDto): Promise<VatRateDto> {
    if (data.isDefault) await this.repo.clearDefault()
    return this.toDto(await this.repo.create(data))
  }

  async update(data: UpdateVatRateDto): Promise<VatRateDto> {
    if (data.isDefault) await this.repo.clearDefault()
    return this.toDto(await this.repo.update(data))
  }

  async remove(id: number): Promise<void> {
    await this.repo.remove(id)
  }

  protected toDto(rate: VatRate): VatRateDto {
    return { ...rate }
  }
}
