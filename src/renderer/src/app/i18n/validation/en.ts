export default {
  required:  'This field is required',
  email:     'Invalid email address',
  minlength: 'Minimum {min} characters',
  maxlength: 'Maximum {max} characters',
  unknown:   'Invalid value',
} satisfies Record<string, string>
