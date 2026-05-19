import { Component, input, model, output } from '@angular/core'
import { LucideSearch, LucideX } from '@lucide/angular'

@Component({
  selector: 'app-search-bar',
  imports: [LucideSearch, LucideX],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  readonly placeholder = input<string>('Search...')
  readonly value       = model<string>('')
  readonly search      = output<string>()

  private _timer: ReturnType<typeof setTimeout> | null = null

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value
    this.value.set(val)
    if (this._timer) clearTimeout(this._timer)
    this._timer = setTimeout(() => this.search.emit(val), 300)
  }

  clear(): void {
    this.value.set('')
    this.search.emit('')
  }
}
