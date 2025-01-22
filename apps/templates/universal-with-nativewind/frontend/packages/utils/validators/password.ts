import { z } from 'zod';
export const password = z.string().regex(new RegExp('.*\\d.*'), 'One number');
// .min(8, '8 characters minimum')
// .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
// .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
// .regex(
//   new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
//   'One special character'
// );
