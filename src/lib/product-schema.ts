import { z } from 'zod';

const imageSchema = z.string().max(2_800_000).refine((image) => {
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image)) return true;
  try {
    return new URL(image).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Images must be HTTPS URLs or JPEG, PNG, or WebP uploads under 2 MB.');

export const productSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(5000),
  price: z.number().finite().positive(),
  categoryId: z.string().min(1),
  province: z.string().trim().min(2).max(100),
  district: z.string().trim().max(100).optional(),
  condition: z.string().trim().min(2).max(40),
  phone: z.string().trim().max(40).optional(),
  images: z.array(imageSchema).max(3).optional(),
});
