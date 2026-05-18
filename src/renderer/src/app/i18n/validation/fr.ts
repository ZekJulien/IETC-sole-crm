export default {
  required:  'Ce champ est obligatoire',
  email:     'Adresse email invalide',
  minlength: 'Minimum {min} caractères',
  maxlength: 'Maximum {max} caractères',
  unknown:   'Valeur invalide',
} satisfies Record<string, string>
