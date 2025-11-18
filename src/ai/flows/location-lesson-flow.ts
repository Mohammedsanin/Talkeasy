'use server';
/**
 * @fileOverview An AI agent that generates location-based language mini-lessons.
 *
 * - generateLocationLesson - A function that handles the lesson generation.
 * - LocationLessonInput - The input type for the generateLocationLesson function.
 * - LocationLessonOutput - The return type for the generateLocationLesson function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LocationLessonInputSchema = z.object({
  locationName: z.string().describe('The name of the location, e.g., "Bangalore Market".'),
  language: z.string().describe('The language to learn, e.g., "Kannada".'),
});
export type LocationLessonInput = z.infer<typeof LocationLessonInputSchema>;

const LocationLessonOutputSchema = z.object({
  vocabulary: z.array(z.object({
    word: z.string(),
    translation: z.string(),
  })).describe('A short list of 2-3 relevant vocabulary words for the location.'),
  conversation: z.array(z.object({
      person: z.string(),
      phrase: z.string(),
  })).describe('A very short, simple, two-line conversational exchange relevant to the location.'),
  culturalContext: z.string().describe('A brief, interesting cultural fact or tip about the location or the language used there.'),
  nextStopSuggestion: z.string().describe('A suggestion for a nearby or related point of interest for the user to explore next.'),
});
export type LocationLessonOutput = z.infer<typeof LocationLessonOutputSchema>;


export async function generateLocationLesson(
  input: LocationLessonInput
): Promise<LocationLessonOutput> {
  return locationLessonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'locationLessonPrompt',
  input: { schema: LocationLessonInputSchema },
  output: { schema: LocationLessonOutputSchema },
  prompt: `You are an expert language and culture tutor creating a mini-lesson for a language learner exploring a city map. The lesson should be concise, relevant, and engaging.

Location: {{{locationName}}}
Language: {{{language}}}

Based on this location and language, generate a mini-lesson. Provide:
1.  A short list of 2-3 essential vocabulary words with their English translations.
2.  A simple two-line conversation (e.g., Customer and Vendor) that would happen at this location.
3.  A single, interesting cultural tip related to the location or the interaction.
4.  A creative suggestion for a "next stop" for the user to continue their virtual exploration.`,
});

const locationLessonFlow = ai.defineFlow(
  {
    name: 'locationLessonFlow',
    inputSchema: LocationLessonInputSchema,
    outputSchema: LocationLessonOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
