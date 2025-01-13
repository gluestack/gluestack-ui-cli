import { z } from 'zod';
export const otp = z
  .string()
  .min(1, 'OTP is required')
  .regex(/^\d+$/, 'OTP must only contain numbers');
