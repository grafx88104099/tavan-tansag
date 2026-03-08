'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeSnuffBottleInputSchema = z.object({
  photoDataUri: z.string().describe('The uploaded image encoded as a data URI.'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).describe('The MIME type of the uploaded image.'),
  context: z.string().max(300).optional().describe('Optional user note about the snuff bottle or the uploaded image.'),
});
export type AnalyzeSnuffBottleInput = z.infer<typeof AnalyzeSnuffBottleInputSchema>;

const AnalyzeSnuffBottleOutputSchema = z.object({
  identifiedObject: z.string().describe('The object seen in the image, written in Mongolian.'),
  isLikelySnuffBottle: z.boolean().describe('Whether the object is likely a Mongolian snuff bottle.'),
  isSnuffBottleRelated: z.boolean().describe('Whether the object is a Mongolian snuff bottle or a likely snuff bottle component/accessory.'),
  isLikelyCoralTop: z.boolean().describe('Whether the object is likely a coral snuff bottle top/head.'),
  domainCategory: z
    .enum(['complete_snuff_bottle', 'coral_top', 'top_or_cap', 'loose_stone_or_bead', 'not_snuff_related'])
    .describe('Domain-specific category for snuff bottle recognition.'),
  partName: z.string().describe('If the image shows a snuff bottle part, name it in Mongolian. Otherwise describe as "Бүтэн хөөрөг" or "Холбогдолгүй".'),
  confidenceLevel: z.enum(['high', 'medium', 'low']).describe('Confidence in the visual assessment.'),
  overallAssessment: z.string().describe('A short Mongolian assessment summarizing the finding.'),
  bodyMaterial: z.string().describe('Likely body material in Mongolian. Use "Тодорхойгүй" when not visible.'),
  mountMaterial: z.string().describe('Likely metal mount or fitting material in Mongolian. Use "Тодорхойгүй" when not visible.'),
  capMaterial: z.string().describe('Likely cap or lid material in Mongolian. Use "Тодорхойгүй" when not visible.'),
  capStoneType: z.string().describe('Likely stone/mineral used for the top or cap, in Mongolian. Use "Тодорхойгүй" if not visible.'),
  capShape: z.string().describe('Visual shape of the cap or coral top in Mongolian. Use "Тодорхойгүй" if not visible.'),
  spoonMaterial: z.string().describe('Likely spoon or stem material in Mongolian. Use "Харагдахгүй" when not visible.'),
  stoneTypes: z.array(z.string()).describe('Visible stone or mineral types in Mongolian. Return an empty array if none are visible.'),
  ornamentDetails: z.array(z.string()).describe('Visible decorative details or motifs in Mongolian.'),
  evidence: z.array(z.string()).describe('Concrete visual cues that support the assessment, in Mongolian.'),
  uncertainties: z.array(z.string()).describe('Uncertain areas or details that cannot be reliably identified from this image, in Mongolian.'),
  followUpAdvice: z.string().describe('A short Mongolian recommendation for what extra photo would improve certainty.'),
});
export type AnalyzeSnuffBottleOutput = z.infer<typeof AnalyzeSnuffBottleOutputSchema>;

export async function analyzeSnuffBottle(input: AnalyzeSnuffBottleInput): Promise<AnalyzeSnuffBottleOutput> {
  return analyzeSnuffBottleFlow(input);
}

const snuffBottlePrompt = ai.definePrompt({
  name: 'analyzeSnuffBottlePrompt',
  input: { schema: AnalyzeSnuffBottleInputSchema },
  output: { schema: AnalyzeSnuffBottleOutputSchema },
  messages: async (input) => [
    {
      role: 'user',
      content: [
        {
          text: `Та Монгол хөөрөг таних чиглэлээр ажилладаг маш болгоомжтой визуал шинжээч.

Даалгавар:
1. Зураг дээрх зүйл хөөрөг мөн эсэхийг үнэл.
2. Хөөрөг бол их биеийн материал, металл тоног, таг, халбага/савх, чулууг ялгаж таамагла.
3. Хэрэв бүтэн хөөрөг биш ч хөөрөгний толгой, таг, шүрэн толгой зэрэг эд анги харагдаж байвал түүнийг хөөрөгтэй холбоотой эд анги гэж ангил.
4. Зөвхөн харагдаж буй шинж дээр тулгуурла. Итгэлгүй үед "Тодорхойгүй" гэж бич.
5. Чулуу харагдахгүй бол stoneTypes хоосон массив буцаа.
6. Хөөрөг биш бол isLikelySnuffBottle=false гэж өгөөд material талбаруудад боломжтой бол тайлбарла, эсвэл "Тодорхойгүй" гэж бөглө.
7. Хариултыг бүхэлд нь Монгол хэлээр өг. Тансаг сурталчилгааны өнгө биш, бодитой үнэлгээ өг.

Анхаарах зүйлс:
- Боломжит материалууд: мана, хаш, оюу, шүр, мөнгө, алт, гууль, зэс, чулуу, яс, мод, шил, хув, болор гэх мэт.
- Металл эд анги болон их биеийн үндсэн материалыг хооронд нь бүү андуур.
- Хэт итгэлтэй худал дүгнэлт бүү гарга.
- Evidence хэсэгт харагдаж буй өнгө, гадаргуу, тунгалаг байдал, шигтгээ, металл хүрээ, тагны хийц зэрэг баримтыг товч жагсаа.`,
        },
        {
          text: `Шүрэн толгой таних тусгай дүрэм:
- "Хөөрөгний шүрэн толгой" нь ихэвчлэн тусдаа жижиг цилиндр, бөмбөгөр, товгор малгай хэлбэртэй байдаг.
- Түгээмэл өнгө нь улбар улаан, тоорын ягаан, улаан хүрэн, шүрэн улаан.
- Ихэнхдээ өнгөлсөн, жигд гялгар, opaque эсвэл бага зэрэг нэвт гэрэлтэх шинжтэй.
- Заримд нь цайвар судал, үүлэрхэг зурвас, байгалийн зөөлөн өнгөний зөрүү ажиглагдана.
- Нэг зурагт олон жижиг ижил төрлийн толгой хэмжээ хэмжээгээрээ зэрэгцсэн байвал domainCategory-г coral_top эсвэл top_or_cap гэж нухацтай авч үз.
- Шүрэн толгой нь дангаараа харагдаж болно. Ийм үед isLikelySnuffBottle=false байж болно, гэхдээ isSnuffBottleRelated=true гэж үнэл.
- Шүрэн улаан өнгөтэй ч хуванцар, давирхай, шил, мана байж болзошгүй. Тиймээс evidence дээр гадаргуу, өнгөний жигд бус байдал, байгалийн судал, металл суурийн ул мөр байгаа эсэхийг дурд.
- Хэрэв шүрэн толгой байх магадлал өндөр бол partName-д "Хөөрөгний шүрэн толгой" гэж бич, capStoneType-д "Шүр" гэж өг.`,
        },
        {
          media: {
            url: input.photoDataUri,
            contentType: input.mimeType,
          },
        },
        ...(input.context
          ? [
              {
                text: `Хэрэглэгчийн нэмэлт тайлбар: ${input.context}`,
              },
            ]
          : []),
      ],
    },
  ],
});

const analyzeSnuffBottleFlow = ai.defineFlow(
  {
    name: 'analyzeSnuffBottleFlow',
    inputSchema: AnalyzeSnuffBottleInputSchema,
    outputSchema: AnalyzeSnuffBottleOutputSchema,
  },
  async (input) => {
    const { output } = await snuffBottlePrompt(input);
    if (!output) {
      throw new Error('Snuff bottle analysis did not return structured output.');
    }
    return output;
  }
);
