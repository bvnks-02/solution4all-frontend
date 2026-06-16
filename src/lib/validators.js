import { z } from 'zod';

export const contactSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.enum(['general', 'commercial', 'ecommerce', 'technical'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un département' }),
  }),
  subject: z.string().min(5, "L'objet doit contenir au moins 5 caractères"),
  message: z
    .string()
    .min(20, 'Le message doit contenir au moins 20 caractères')
    .max(5000, 'Message trop long'),
});

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  customer_email: z.string().email('Adresse email invalide'),
  customer_phone: z.string().min(1, 'Le téléphone est requis'),
  customer_company: z.string().optional(),
  wilaya: z.string().min(1, 'Veuillez sélectionner une wilaya'),
  address: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  notes: z.string().optional(),
  // honeypot field for spam prevention
  website: z.string().max(0).optional(),
});
