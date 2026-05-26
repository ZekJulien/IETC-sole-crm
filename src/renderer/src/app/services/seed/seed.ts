import { Injectable } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class SeedService {
  async requiredDefaults(): Promise<void> {
    const res = await window.api.seed.requiredDefaults()
    if (res.error) throw new Error(res.error.message)
  }

  async demo(): Promise<void> {
    const res = await window.api.seed.demo()
    if (res.error) throw new Error(res.error.message)
  }

  async reset(): Promise<void> {
    const res = await window.api.seed.reset()
    if (res.error) throw new Error(res.error.message)
  }
}
