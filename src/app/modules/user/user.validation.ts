import { z } from 'zod';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({ required_error: 'Confirm Password is required' }),
    location: z.string({ required_error: 'Location is required' }),
    drivingLicense: z.array(z.string()).min(1, 'At least one driving license is required'),
    yourID: z.array(z.string()).min(1, 'At least one your ID is required'),
    profile: z.string().optional(),
    description: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  drivingLicense: z.array(z.string()).optional(),
  yourID: z.array(z.string()).optional(),
  image: z.string().optional(),
  description: z.string().optional()
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
};
