import { AbstractControl, ValidatorFn, Validators } from '@angular/forms'
import { getCountryFormat, PHONE_INTERNATIONAL_RE } from '@shared/validation/eu-formats'

export const PEPPOL_RE = /^\d{4}:[\w\-./:]+$/
export const COUNTER_TOKEN_RE = /\{#+\}/

export const companyValidators = {
  name:    [Validators.required, Validators.minLength(2)],
  email:   [Validators.email],
  phone:   [Validators.pattern(PHONE_INTERNATIONAL_RE)],
  peppolId:[Validators.pattern(PEPPOL_RE)],
  vatRate: [Validators.required, Validators.min(0), Validators.max(100)],
  terms:   [Validators.required, Validators.min(0)],
}

export const numberFormatValidator: ValidatorFn = (ctrl: AbstractControl) =>
  ctrl.value && !COUNTER_TOKEN_RE.test(ctrl.value) ? { pattern: true } : null

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
