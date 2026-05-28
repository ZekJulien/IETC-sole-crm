import { Injectable, computed, signal } from '@angular/core'
import { VatRateDto, CreateVatRateDto, UpdateVatRateDto } from '@shared/dtos/vat-rate'
import { FindManyArgs } from '@shared/types'
import { DEFAULT_VAT_RATE } from '@shared/utils/vat-defaults'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class VatRateService {
  private readonly _items   = signal<VatRateDto[]>([])
  private readonly _loading = signal<boolean>(false)

  readonly items       = this._items.asReadonly()
  readonly loading     = this._loading.asReadonly()
  readonly defaultRate = computed(() =>
    this._items().find(r => r.isDefault)?.rate ?? this._items()[0]?.rate ?? DEFAULT_VAT_RATE
  )

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const result = unwrap(await window.api.vatRate.get(args))
    this._items.set(result.data)
    this._loading.set(false)
  }

  async add(data: CreateVatRateDto): Promise<VatRateDto> {
    const created = unwrap(await window.api.vatRate.add(data))
    this._items.update(list => [...this.clearOtherDefaults(list, created), created])
    return created
  }

  async update(data: UpdateVatRateDto): Promise<VatRateDto> {
    const updated = unwrap(await window.api.vatRate.update(data))
    this._items.update(list =>
      this.clearOtherDefaults(list, updated).map(r => r.id === updated.id ? updated : r)
    )
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.vatRate.remove(id))
    this._items.update(list => list.filter(r => r.id !== id))
  }

  private clearOtherDefaults(list: VatRateDto[], current: VatRateDto): VatRateDto[] {
    if (!current.isDefault) return list
    return list.map(r => r.id !== current.id && r.isDefault ? { ...r, isDefault: false } : r)
  }
}
