import { Component, computed, input } from '@angular/core'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  readonly firstName = input<string | null>(null)
  readonly lastName  = input.required<string>()
  readonly size      = input<'sm' | 'md' | 'lg'>('md')

  readonly initials = computed(() => {
    const f = this.firstName()?.[0]?.toUpperCase() ?? ''
    const l = this.lastName()[0]?.toUpperCase() ?? ''
    return f ? `${f}${l}` : l
  })

  readonly color = computed(() => {
    const str  = (this.firstName() ?? '') + this.lastName()
    const hash = [...str].reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const colors = ['accent', 'info', 'success', 'warning', 'danger']
    return colors[hash % colors.length]
  })
}
