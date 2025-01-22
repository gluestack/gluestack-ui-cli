import { z } from 'zod';

export const zipCode = z
  .string()
  // Allow an empty string if the field is not required
  .optional()
  // Ensure the length is between 3 and 8 characters if a value is provided
  .refine(
    (value: any) => value === '' || (value.length >= 3 && value.length <= 8),
    {
      message: 'Zipcode must be between 3 and 8 characters',
    }
  )
  // Validate that the string only contains digits (0-9) if a value is provided
  .refine((value: any) => value === '' || /^\d+$/.test(value), {
    message: 'Zipcode must only contain digits (0-9)',
  });
