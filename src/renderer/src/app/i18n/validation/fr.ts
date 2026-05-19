export default {
  required:      'Ce champ est obligatoire',
  email:         'Adresse email invalide',
  minlength:     'Minimum {min} caractères',
  maxlength:     'Maximum {max} caractères',
  pattern:       'Format invalide',
  phone:         'Téléphone invalide (format international, ex. +32 471 23 45 67)',
  postalCode:    'Code postal invalide pour le pays sélectionné',
  companyNumber: 'Numéro d\'entreprise invalide pour le pays sélectionné',
  vatNumber:     'Numéro TVA invalide pour le pays sélectionné',
  peppolId:      'ID PEPPOL invalide (ex. 0208:0123456789)',
  unknown:       'Valeur invalide',
} satisfies Record<string, string>
