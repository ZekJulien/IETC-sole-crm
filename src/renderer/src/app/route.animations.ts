import { animate, group, query, style, transition, trigger } from '@angular/animations'

export const routeAnim = trigger('routeAnim', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }),
    ], { optional: true }),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [animate('200ms ease-out', style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate('250ms ease-in',  style({ opacity: 1 }))], { optional: true }),
    ]),
  ]),
])
