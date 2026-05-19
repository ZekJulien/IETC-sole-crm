/**
 * Formats de validation par pays de l'Union européenne.
 *
 * Chaque pays expose :
 *   - postalCode    : regex pour le code postal national
 *   - vatNumber     : regex pour le numéro TVA (préfixe pays + format national)
 *   - companyNumber : regex pour le numéro d'enregistrement entreprise (si applicable)
 *
 * Les regex sont volontairement permissives sur les séparateurs (espaces, tirets, points)
 * pour ne pas refuser des entrées valides juste à cause du formatage.
 *
 * Les noms alternatifs (FR/EN/local) permettent de matcher un pays même si l'utilisateur
 * saisit "Belgique", "Belgium" ou "België" — pas seulement le code ISO "BE".
 */

export interface CountryFormat {
  code:           string     // ISO 3166-1 alpha-2
  names:          string[]   // noms acceptés (matching case-insensitive)
  postalCode:     RegExp
  vatNumber:      RegExp
  companyNumber?: RegExp     // certains pays utilisent la TVA comme identifiant entreprise
}

export const EU_COUNTRIES: Record<string, CountryFormat> = {
  AT: {
    code: 'AT', names: ['Autriche', 'Austria', 'Österreich'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^ATU\d{8}$/i,
    companyNumber: /^FN\s?\d{6}[a-z]$/i,
  },
  BE: {
    code: 'BE', names: ['Belgique', 'Belgium', 'België', 'Belgien'],
    postalCode:    /^[1-9]\d{3}$/,
    vatNumber:     /^BE\s*0\d{9}$/i,
    companyNumber: /^(BE\s*)?0\d{9}$/i,
  },
  BG: {
    code: 'BG', names: ['Bulgarie', 'Bulgaria', 'България'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^BG\d{9,10}$/i,
  },
  CY: {
    code: 'CY', names: ['Chypre', 'Cyprus', 'Κύπρος'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^CY\d{8}[A-Z]$/i,
  },
  CZ: {
    code: 'CZ', names: ['Tchéquie', 'Czech Republic', 'Czechia', 'Česko'],
    postalCode:    /^\d{3}\s?\d{2}$/,
    vatNumber:     /^CZ\d{8,10}$/i,
    companyNumber: /^\d{8}$/,
  },
  DE: {
    code: 'DE', names: ['Allemagne', 'Germany', 'Deutschland'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^DE\d{9}$/i,
    companyNumber: /^HRB\s?\d{1,6}$/i,
  },
  DK: {
    code: 'DK', names: ['Danemark', 'Denmark', 'Danmark'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^DK\d{8}$/i,
    companyNumber: /^\d{8}$/,
  },
  EE: {
    code: 'EE', names: ['Estonie', 'Estonia', 'Eesti'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^EE\d{9}$/i,
    companyNumber: /^\d{8}$/,
  },
  ES: {
    code: 'ES', names: ['Espagne', 'Spain', 'España'],
    postalCode:    /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/,
    vatNumber:     /^ES[A-Z0-9]\d{7}[A-Z0-9]$/i,
    companyNumber: /^[A-Z]\d{8}$/i,
  },
  FI: {
    code: 'FI', names: ['Finlande', 'Finland', 'Suomi'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^FI\d{8}$/i,
    companyNumber: /^\d{7}-\d$/,
  },
  FR: {
    code: 'FR', names: ['France'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^FR[A-HJ-NP-Z0-9]{2}\d{9}$/i,
    companyNumber: /^\d{9}(\d{5})?$/,  // SIREN (9) ou SIRET (14)
  },
  GR: {
    code: 'GR', names: ['Grèce', 'Greece', 'Ελλάδα'],
    postalCode:    /^\d{3}\s?\d{2}$/,
    vatNumber:     /^EL\d{9}$/i,  // attention : préfixe EL, pas GR
  },
  HR: {
    code: 'HR', names: ['Croatie', 'Croatia', 'Hrvatska'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^HR\d{11}$/i,
    companyNumber: /^\d{11}$/,
  },
  HU: {
    code: 'HU', names: ['Hongrie', 'Hungary', 'Magyarország'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^HU\d{8}$/i,
  },
  IE: {
    code: 'IE', names: ['Irlande', 'Ireland', 'Éire'],
    postalCode:    /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i,  // Eircode
    vatNumber:     /^IE\d{7}[A-Z]{1,2}$/i,
  },
  IT: {
    code: 'IT', names: ['Italie', 'Italy', 'Italia'],
    postalCode:    /^\d{5}$/,
    vatNumber:     /^IT\d{11}$/i,
    companyNumber: /^\d{11}$/,  // partita IVA = code entreprise
  },
  LT: {
    code: 'LT', names: ['Lituanie', 'Lithuania', 'Lietuva'],
    postalCode:    /^(LT-)?\d{5}$/i,
    vatNumber:     /^LT(\d{9}|\d{12})$/i,
  },
  LU: {
    code: 'LU', names: ['Luxembourg'],
    postalCode:    /^(L-)?\d{4}$/i,
    vatNumber:     /^LU\d{8}$/i,
    companyNumber: /^[A-Z]\d{6}$/i,
  },
  LV: {
    code: 'LV', names: ['Lettonie', 'Latvia', 'Latvija'],
    postalCode:    /^(LV-)?\d{4}$/i,
    vatNumber:     /^LV\d{11}$/i,
  },
  MT: {
    code: 'MT', names: ['Malte', 'Malta'],
    postalCode:    /^[A-Z]{3}\s?\d{4}$/i,
    vatNumber:     /^MT\d{8}$/i,
  },
  NL: {
    code: 'NL', names: ['Pays-Bas', 'Netherlands', 'Nederland'],
    postalCode:    /^\d{4}\s?[A-Z]{2}$/i,
    vatNumber:     /^NL\d{9}B\d{2}$/i,
    companyNumber: /^\d{8}$/,  // KvK
  },
  PL: {
    code: 'PL', names: ['Pologne', 'Poland', 'Polska'],
    postalCode:    /^\d{2}-\d{3}$/,
    vatNumber:     /^PL\d{10}$/i,
  },
  PT: {
    code: 'PT', names: ['Portugal'],
    postalCode:    /^\d{4}-\d{3}$/,
    vatNumber:     /^PT\d{9}$/i,
    companyNumber: /^\d{9}$/,  // NIPC
  },
  RO: {
    code: 'RO', names: ['Roumanie', 'Romania', 'România'],
    postalCode:    /^\d{6}$/,
    vatNumber:     /^RO\d{2,10}$/i,
  },
  SE: {
    code: 'SE', names: ['Suède', 'Sweden', 'Sverige'],
    postalCode:    /^\d{3}\s?\d{2}$/,
    vatNumber:     /^SE\d{12}$/i,
    companyNumber: /^\d{6}-\d{4}$/,
  },
  SI: {
    code: 'SI', names: ['Slovénie', 'Slovenia', 'Slovenija'],
    postalCode:    /^\d{4}$/,
    vatNumber:     /^SI\d{8}$/i,
  },
  SK: {
    code: 'SK', names: ['Slovaquie', 'Slovakia', 'Slovensko'],
    postalCode:    /^\d{3}\s?\d{2}$/,
    vatNumber:     /^SK\d{10}$/i,
  },
}

/** Retourne le format du pays, ou null si non reconnu (laisse passer = validation lenient). */
export function getCountryFormat(value: string | null | undefined): CountryFormat | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  for (const country of Object.values(EU_COUNTRIES)) {
    if (country.code.toLowerCase() === normalized) return country
    if (country.names.some(n => n.toLowerCase() === normalized)) return country
  }
  return null
}

/** Téléphone international (E.164 lenient) : préfixe pays + chiffres/séparateurs courants. */
export const PHONE_INTERNATIONAL_RE = /^\+?[\d\s().\-]{6,20}$/
