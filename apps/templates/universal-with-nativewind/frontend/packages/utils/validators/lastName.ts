import { z } from 'zod';

export const lastName = z
  .string()
  .optional()
  .refine((val: any) => !/\d/.test(val), {
    message: 'Name cannot contain numbers.',
  });
