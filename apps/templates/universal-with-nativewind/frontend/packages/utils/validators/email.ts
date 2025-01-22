import { z } from 'zod';
export const email = z.string().min(1, 'Email is required').email();
