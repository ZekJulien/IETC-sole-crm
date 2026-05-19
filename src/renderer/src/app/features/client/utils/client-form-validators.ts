/**
 * Helpers de validation partagés entre le form de création (app-client-form)
 * et le form d'édition inline (editForm dans ClientList).
 *
 * Évite la duplication de la logique : validators dynamiques sur firstName
 * (selon le type) et sur zipCode/vatNumber/companyNumber (selon le pays UE).
 */

import { FormGroup, Validators } from '@angular/forms'
import { ClientType } from '@shared/dtos/client'
import { getCountryFormat, PHONE_INTERNATIONAL_RE } from '@shared/validation/eu-formats'

/** Format universel scheme:identifier — pas country-dependent. */
export const PEPPOL_RE = /^\d{4}:[\w\-./:]+$/

/** Valide téléphone international + bloc email/peppol/name (validators statiques communs). */
export function applyStaticClientValidators(form: FormGroup): void {
  form.get('name')?.setValidators([Validators.required, Validators.minLength(2)])
  form.get('email')?.setValidators([Validators.required, Validators.email])
  form.get('phone')?.setValidators([Validators.pattern(PHONE_INTERNATIONAL_RE)])
  form.get('peppolId')?.setValidators([Validators.pattern(PEPPOL_RE)])
}

/** firstName est requis quand le type est INDIVIDUAL, sinon optional. */
export function syncFirstNameValidator(form: FormGroup, type: ClientType): void {
  const firstName = form.get('firstName')
  if (!firstName) return
  if (type === ClientType.INDIVIDUAL) firstName.setValidators([Validators.required])
  else                                firstName.clearValidators()
  firstName.updateValueAndValidity({ emitEvent: false })
}

/**
 * Applique les regex spécifiques au pays sur zipCode/vatNumber/companyNumber.
 * Pays non reconnu (UE) → validators clear (lenient).
 */
export function syncCountryValidators(form: FormGroup, country: string): void {
  const format        = getCountryFormat(country)
  const zipCode       = form.get('zipCode')
  const vatNumber     = form.get('vatNumber')
  const companyNumber = form.get('companyNumber')

  zipCode?.setValidators(format       ? [Validators.pattern(format.postalCode)] : [])
  vatNumber?.setValidators(format     ? [Validators.pattern(format.vatNumber)]  : [])
  companyNumber?.setValidators(format?.companyNumber ? [Validators.pattern(format.companyNumber)] : [])

  zipCode?.updateValueAndValidity({ emitEvent: false })
  vatNumber?.updateValueAndValidity({ emitEvent: false })
  companyNumber?.updateValueAndValidity({ emitEvent: false })
}
