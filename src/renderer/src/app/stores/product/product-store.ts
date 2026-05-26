import { Injectable, computed, inject, signal } from '@angular/core'
import { ProductDto, CreateProductDto, UpdateProductDto } from '@shared/dtos/product'
import { FindManyArgs } from '@shared/types'
import { ProductService } from '@app/services/product/product'
import { ToastService } from '@app/services/toast/toast.service'
import { ErrorService } from '@app/services/error/error.service'
import { I18nService } from '@app/services/i18n/i18n'

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private readonly productSvc = inject(ProductService)
  private readonly toast      = inject(ToastService)
  private readonly errors     = inject(ErrorService)
  private readonly i18n       = inject(I18nService)

  private readonly _saving = signal<boolean>(false)

  readonly products = this.productSvc.products
  readonly loading  = this.productSvc.loading
  readonly saving   = this._saving.asReadonly()
  readonly isEmpty  = computed(() => this.productSvc.products().length === 0)

  async load(args?: FindManyArgs): Promise<void> {
    try { await this.productSvc.load(args) }
    catch (e) { this.errors.handle(e) }
  }

  async add(data: CreateProductDto): Promise<ProductDto | null> {
    this._saving.set(true)
    try {
      const created = await this.productSvc.add(data)
      this.toast.success(this.i18n.t('product.toast.created'))
      return created
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async update(data: UpdateProductDto): Promise<ProductDto | null> {
    this._saving.set(true)
    try {
      const updated = await this.productSvc.update(data)
      this.toast.success(this.i18n.t('product.toast.saved'))
      return updated
    } catch (e) { this.errors.handle(e); return null }
    finally { this._saving.set(false) }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.productSvc.remove(id)
      this.toast.success(this.i18n.t('product.toast.deleted'))
    } catch (e) { this.errors.handle(e) }
  }
}
