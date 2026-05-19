import { animate, group, query, style, transition, trigger } from '@angular/animations'

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

export const viewSwitchAnim = trigger('viewSwitch', [
  transition('* => *', [
    query(':enter, :leave', [
      style({ position: 'absolute', inset: 0 }),
    ], { optional: true }),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    group([
      query(':leave', [animate(`100ms ease-out`, style({ opacity: 0 }))], { optional: true }),
      query(':enter', [animate(`220ms 60ms ${EASE}`, style({ opacity: 1 }))], { optional: true }),
    ]),
  ]),
])
