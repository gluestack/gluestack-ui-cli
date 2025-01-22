import { z } from 'zod';
export const confirmPassword = z
  .string()
  .min(1, 'Confirm password is required');
