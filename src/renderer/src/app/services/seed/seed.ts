import { Injectable } from '@angular/core'
import { unwrap } from '@app/utils'

@Injectable({ providedIn: 'root' })
export class SeedService {
  async requiredDefaults(): Promise<void> {
    unwrap(await window.api.seed.requiredDefaults())
  }

  async demo(): Promise<void> {
    unwrap(await window.api.seed.demo())
  }

  async reset(): Promise<void> {
    unwrap(await window.api.seed.reset())
  }
}
