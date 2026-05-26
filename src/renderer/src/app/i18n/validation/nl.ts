export default {
  required:      'Dit veld is verplicht',
  email:         'Ongeldig e-mailadres',
  minlength:     'Minimaal {min} tekens',
  maxlength:     'Maximaal {max} tekens',
  pattern:       'Ongeldig formaat',
  phone:         'Ongeldig telefoonnummer (internationaal formaat, bijv. +32 471 23 45 67)',
  postalCode:    'Ongeldige postcode voor het geselecteerde land',
  companyNumber: 'Ongeldig ondernemingsnummer voor het geselecteerde land',
  vatNumber:     'Ongeldig btw-nummer voor het geselecteerde land',
  peppolId:      'Ongeldige PEPPOL-id (bijv. 0208:0123456789)',
  unknown:       'Ongeldige waarde',
} satisfies Record<string, string>
