import { z } from 'zod';

export const gender = z
  .string()
  .min(1, 'Please select your gender.')
  .optional();
