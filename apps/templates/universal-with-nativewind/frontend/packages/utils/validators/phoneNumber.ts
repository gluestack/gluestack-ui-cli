import { z } from 'zod';

export const phoneNumber = z.string().refine(
  (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value);
  },
  {
    message: 'Invalid phone number',
  }
);

export type PhoneNumberType = z.infer<typeof phoneNumber>;
