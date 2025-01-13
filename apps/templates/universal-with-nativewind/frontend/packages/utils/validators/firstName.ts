import { z } from 'zod';

export const firstName = z
  .string()
  .min(3, 'Required. Please enter a valid name.')
  .refine((val) => !/\d/.test(val), {
    message: 'Name cannot contain numbers.',
  });
