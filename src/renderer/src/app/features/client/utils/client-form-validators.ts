import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'
import { ClientType } from '@shared/dtos/client'
import { getCountryFormat, PHONE_INTERNATIONAL_RE } from '@shared/validation/eu-formats'

export const PEPPOL_RE = /^\d{4}:[\w\-./:]+$/

export const clientValidators = {
  name:     [Validators.required, Validators.minLength(2)],
  email:    [Validators.required, Validators.email],
  phone:    [Validators.pattern(PHONE_INTERNATIONAL_RE)],
  peppolId: [Validators.pattern(PEPPOL_RE)],
}

export const firstNameValidator: ValidatorFn = (ctrl: AbstractControl) => {
  const type = ctrl.parent?.get('type')?.value
  return type === ClientType.INDIVIDUAL && !ctrl.value ? { required: true } : null
}

export const zipCodeValidator: ValidatorFn = (ctrl: AbstractControl) => {
  const format = getCountryFormat(ctrl.parent?.get('country')?.value)
  if (!format || !ctrl.value) return null
  return format.postalCode.test(ctrl.value) ? null : { pattern: true }
}

export const vatNumberValidator: ValidatorFn = (ctrl: AbstractControl) => {
  const format = getCountryFormat(ctrl.parent?.get('country')?.value)
  if (!format || !ctrl.value) return null
  return format.vatNumber.test(ctrl.value) ? null : { pattern: true }
}

export const companyNumberValidator: ValidatorFn = (ctrl: AbstractControl) => {
  const format = getCountryFormat(ctrl.parent?.get('country')?.value)
  if (!format?.companyNumber || !ctrl.value) return null
  return format.companyNumber.test(ctrl.value) ? null : { pattern: true }
}
