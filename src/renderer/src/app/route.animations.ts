import { animate, query, style, transition, trigger } from '@angular/animations'

export const routeAnim = trigger('routeAnim', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0 }),
      animate('180ms ease-out', style({ opacity: 1 })),
    ], { optional: true }),
  ]),
])
