'use server';
/**
 * @fileOverview An AI agent that analyzes a video to suggest conversational phrases for the situation.
 *
 * - videoContextTranslator - A function that handles the video analysis and text generation.
 * - VideoContextTranslatorInput - The input type for the function.
 * - VideoContextTranslatorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VideoContextTranslatorInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video of a situation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The target language for the conversational phrases.'),
});
export type VideoContextTranslatorInput = z.infer<typeof VideoContextTranslatorInputSchema>;

const VideoContextTranslatorOutputSchema = z.object({
  situation: z.string().describe('A brief description of the situation identified in the video.'),
  suggestedPhrases: z.array(
      z.object({
          context: z.string().describe('When to use the phrase, e.g., "To get attention".'),
          phrase: z.string().describe('The suggested phrase in the target language.'),
          translation: z.string().describe('The English translation of the phrase.'),
      })
  ).describe('A list of suggested phrases for the situation.'),
});
export type VideoContextTranslatorOutput = z.infer<typeof VideoContextTranslatorOutputSchema>;

export async function videoContextTranslator(
  input: VideoContextTranslatorInput
): Promise<VideoContextTranslatorOutput> {
  return videoContextTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'videoContextTranslatorPrompt',
  input: { schema: VideoContextTranslatorInputSchema },
  output: { schema: VideoContextTranslatorOutputSchema },
  prompt: `You are a helpful assistant for someone in an emergency or urgent situation.
1. Analyze the provided video to understand the context. For example, is it a fire, a medical emergency, or a car accident?
2. Based on the situation, generate a list of 3-5 simple, clear, and critical phrases someone might need to say.
3. Provide these phrases in the specified target language: {{{language}}}.
4. For each phrase, provide a simple context (e.g., "To ask for help," "To describe the location") and the English translation.

Example for a fire situation in Hindi:
- Situation: Building fire
- Suggested Phrases:
  - Context: "To report the fire." Phrase: "आग लगी है!" (Aag lagi hai!), Translation: "There is a fire!"
  - Context: "To give the location." Phrase: "मेरा पता है..." (Mera pata hai...), Translation: "My address is..."

Video: {{media url=videoDataUri}}
Language: {{{language}}}`,
});

const videoContextTranslatorFlow = ai.defineFlow(
  {
    name: 'videoContextTranslatorFlow',
    inputSchema: VideoContextTranslatorInputSchema,
    outputSchema: VideoContextTranslatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
