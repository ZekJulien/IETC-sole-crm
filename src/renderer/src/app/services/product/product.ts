import { Injectable, computed, signal } from '@angular/core'
import { ProductDto, CreateProductDto, UpdateProductDto } from '@shared/dtos/product'
import { FindManyArgs } from '@shared/types'

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly _products = signal<ProductDto[]>([])
  private readonly _loading  = signal<boolean>(false)

  readonly products = this._products.asReadonly()
  readonly loading  = this._loading.asReadonly()
  readonly hasItems = computed(() => this._products().length > 0)

  async load(args?: FindManyArgs): Promise<void> {
    this._loading.set(true)
    const res = await window.api.product.get(args)
    if (res.error) throw new Error(res.error.message)
    this._products.set(res.data!.data)
    this._loading.set(false)
  }

  async add(data: CreateProductDto): Promise<ProductDto> {
    const res = await window.api.product.add(data)
    if (res.error) throw new Error(res.error.message)
    this._products.update(list => [...list, res.data!])
    return res.data!
  }

  async update(data: UpdateProductDto): Promise<ProductDto> {
    const res = await window.api.product.update(data)
    if (res.error) throw new Error(res.error.message)
    this._products.update(list => list.map(p => p.id === data.id ? res.data! : p))
    return res.data!
  }

  async remove(id: number): Promise<void> {
    const res = await window.api.product.remove(id)
    if (res.error) throw new Error(res.error.message)
    this._products.update(list => list.filter(p => p.id !== id))
  }
}
