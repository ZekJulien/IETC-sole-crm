import { Type } from '@angular/core'

export interface NavItem {
  labelKey:  string
  icon:      Type<unknown>
  route?:    string
  exact?:    boolean
  children?: NavItem[]
}
