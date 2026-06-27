import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  default_country: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const updateProfileSchema = z.object({
  full_name: z.string().min(1).optional(),
  default_country: z.string().optional(),
  risk_sensitivity: z.string().optional(),
  onboarding_complete: z.boolean().optional(),
  current_password: z.string().optional(),
  new_password: z.string().min(8, 'New password must be at least 8 characters').optional(),
});

export const scanDocumentSchema = z.object({
  jurisdiction: z.string().min(1, 'Jurisdiction is required').default('United States'),
  document_type: z.string().min(1, 'Document type is required').default('Other'),
  focus_areas: z.string().default(''),
});
