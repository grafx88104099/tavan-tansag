'use server';
/**
 * @fileOverview A Genkit flow for generating evocative and culturally rich product descriptions for jewelry items.
 *
 * - generateProductStory - A function that handles the product story generation process.
 * - GenerateProductStoryInput - The input type for the generateProductStory function.
 * - GenerateProductStoryOutput - The return type for the generateProductStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductStoryInputSchema = z.object({
  productName: z.string().describe('The name of the jewelry product (e.g., "Nomadic Soul Ring").'),
  category: z.string().describe('The category of the jewelry (e.g., "Ring", "Necklace", "Snuff Bottle").'),
  stoneType: z.string().describe('The type of stone used in the jewelry (e.g., "Turquoise", "Jade", "Coral").'),
  material: z.string().describe('The material of the jewelry (e.g., "Silver", "Gold", "Bronze").'),
  heritageContext: z.string().optional().describe('Optional: Specific Mongolian heritage context or inspiration for the product.'),
});
export type GenerateProductStoryInput = z.infer<typeof GenerateProductStoryInputSchema>;

const GenerateProductStoryOutputSchema = z.object({
  description: z.string().describe('A culturally rich and evocative product description.'),
});
export type GenerateProductStoryOutput = z.infer<typeof GenerateProductStoryOutputSchema>;

export async function generateProductStory(input: GenerateProductStoryInput): Promise<GenerateProductStoryOutput> {
  return generateProductStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductStoryPrompt',
  input: {schema: GenerateProductStoryInputSchema},
  output: {schema: GenerateProductStoryOutputSchema},
  prompt: `You are an expert storyteller specializing in traditional Mongolian jewelry. Your task is to craft an evocative and culturally rich product description that highlights the unique beauty, craftsmanship, and connection to Mongolian heritage for a jewelry item.

Focus on conveying a premium brand feeling, a luxury style, and the deep cultural significance. Use elegant and clean typography in your language.

Product Details:
- Product Name: {{{productName}}}
- Category: {{{category}}}
- Stone Type: {{{stoneType}}}
- Material: {{{material}}}
{{#if heritageContext}}- Heritage Context: {{{heritageContext}}}{{/if}}

Generate a compelling product description:`,
});

const generateProductStoryFlow = ai.defineFlow(
  {
    name: 'generateProductStoryFlow',
    inputSchema: GenerateProductStoryInputSchema,
    outputSchema: GenerateProductStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
