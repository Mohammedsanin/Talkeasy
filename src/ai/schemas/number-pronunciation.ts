import { z } from 'genkit';

export const NumberPronunciationInputSchema = z.object({
  number: z.number().int().describe('The number to be converted.'),
  language: z
    .string()
    .describe('The target language for the pronunciation (e.g., "Hindi").'),
});
export type NumberPronunciationInput = z.infer<
  typeof NumberPronunciationInputSchema
>;

export const NumberPronunciationOutputSchema = z.object({
  writtenNumber: z
    .string()
    .describe('The number written out in words in the target language.'),
  phoneticSpelling: z
    .string()
    .describe('A simple phonetic spelling to help with pronunciation.'),
  audioDataUri: z
    .string()
    .describe('A data URI for the audio narration of the number.'),
});
export type NumberPronunciationOutput = z.infer<
  typeof NumberPronunciationOutputSchema
>;
