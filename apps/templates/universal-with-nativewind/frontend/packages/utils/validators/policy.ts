import { z } from 'zod';

export const policy = z.boolean().refine((value) => value === true, {
  message: 'You must agree with the terms and conditions',
});
