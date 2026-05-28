import { Injectable, computed, signal } from '@angular/core'
import { ProductDto, CreateProductDto, UpdateProductDto } from '@shared/dtos/product'
import { FindManyArgs } from '@shared/types'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<ProductDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly products = this._products.asReadonly()
  readonly loading  = this._loading.asReadonly()
  readonly hasItems = computed(() => this._products().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const result = unwrap(await window.api.product.get(args))
    this._products.set(result.data)
    this._loading.set(false)
  }

  async add(data: CreateProductDto): Promise<ProductDto> {
    const created = unwrap(await window.api.product.add(data))
    this._products.update(list => [...list, created])
    return created
  }

  async update(data: UpdateProductDto): Promise<ProductDto> {
    const updated = unwrap(await window.api.product.update(data))
    this._products.update(list => list.map(p => p.id === data.id ? updated : p))
    return updated
  }

  async remove(id: number): Promise<void> {
    unwrap(await window.api.product.remove(id))
    this._products.update(list => list.filter(p => p.id !== id))
  }
}
