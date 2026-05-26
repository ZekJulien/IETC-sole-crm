export default {
  required:      'Dieses Feld ist erforderlich',
  email:         'Ungültige E-Mail-Adresse',
  minlength:     'Mindestens {min} Zeichen',
  maxlength:     'Höchstens {max} Zeichen',
  pattern:       'Ungültiges Format',
  phone:         'Ungültige Telefonnummer (internationales Format, z. B. +32 471 23 45 67)',
  postalCode:    'Ungültige Postleitzahl für das gewählte Land',
  companyNumber: 'Ungültige Unternehmensnummer für das gewählte Land',
  vatNumber:     'Ungültige USt-IdNr. für das gewählte Land',
  peppolId:      'Ungültige PEPPOL-ID (z. B. 0208:0123456789)',
  unknown:       'Ungültiger Wert',
} satisfies Record<string, string>
