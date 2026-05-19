export default {
  required:      'This field is required',
  email:         'Invalid email address',
  minlength:     'Minimum {min} characters',
  maxlength:     'Maximum {max} characters',
  pattern:       'Invalid format',
  phone:         'Invalid phone (international format, e.g. +32 471 23 45 67)',
  postalCode:    'Invalid postal code for the selected country',
  companyNumber: 'Invalid company number for the selected country',
  vatNumber:     'Invalid VAT number for the selected country',
  peppolId:      'Invalid PEPPOL ID (e.g. 0208:0123456789)',
  unknown:       'Invalid value',
} satisfies Record<string, string>
