'use server';

import { z } from 'zod';
import { generateProductStory, type GenerateProductStoryInput } from '@/ai/flows/ai-powered-product-storyteller';
import { analyzeSnuffBottle, type AnalyzeSnuffBottleInput } from '@/ai/flows/snuff-bottle-analyzer';

const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const customOrderSchema = inquirySchema.extend({
    productType: z.string().optional(),
    materials: z.string().optional(),
    stone: z.string().optional(),
});

export async function submitInquiry(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = inquirySchema.parse(data);
    console.log('New Inquiry:', validatedData);
    // Here you would typically send an email, save to a database, etc.
    return { success: true, message: 'Thank you for your inquiry! We will get back to you soon.' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Please check your input.', errors: error.flatten().fieldErrors };
    }
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function submitCustomOrder(prevState: any, formData: FormData) {
    try {
      const data = Object.fromEntries(formData);
      const validatedData = customOrderSchema.parse(data);
      console.log('New Custom Order Request:', validatedData);
      // Here you would typically save this detailed request to a database.
      return { success: true, message: 'Your custom order request has been received. Our artisans will review it and contact you shortly.' };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { success: false, message: 'Please check your input.', errors: error.flatten().fieldErrors };
      }
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
}


export async function generateStoryAction(input: GenerateProductStoryInput) {
  try {
    const result = await generateProductStory(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to generate product story.' };
  }
}

const analyzeSnuffBottleActionInputSchema = z.object({
  photoDataUri: z
    .string()
    .min(50, 'Зургийн өгөгдөл дутуу байна.')
    .max(6_000_000, 'Зураг хэт том байна. Илүү шахсан зураг оруулна уу.')
    .refine((value) => /^data:image\/(jpeg|png|webp);base64,/.test(value), 'Зөвхөн JPEG, PNG, WEBP зураг дэмжинэ.'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  context: z.string().max(300, 'Нэмэлт тайлбар 300 тэмдэгтээс бага байх ёстой.').optional(),
});

export async function analyzeSnuffBottleAction(input: AnalyzeSnuffBottleInput) {
  try {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENAI_API_KEY) {
      return {
        success: false,
        message: 'AI танигчийг ашиглахын тулд `GEMINI_API_KEY` эсвэл `GOOGLE_API_KEY` орчны хувьсагч тохируулах шаардлагатай.',
      };
    }

    const validatedInput = analyzeSnuffBottleActionInputSchema.parse(input);
    const result = await analyzeSnuffBottle(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0]?.message || 'Оруулсан зургийг шалгаж чадсангүй.' };
    }

    return {
      success: false,
      message: 'Зургийг AI-аар таних үед алдаа гарлаа. API түлхүүр, сүлжээ, эсвэл зургийн чанарыг шалгаад дахин оролдоно уу.',
    };
  }
}
