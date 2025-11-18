import { z } from 'genkit';

export const IdentifyAndPronounceInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of an object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The target language for the pronunciation.'),
});
export type IdentifyAndPronounceInput = z.infer<
  typeof IdentifyAndPronounceInputSchema
>;

export const IdentifyAndPronounceOutputSchema = z.object({
  objectName: z
    .string()
    .describe('The name of the identified object in English.'),
  translatedName: z
    .string()
    .describe('The name of the object translated into the target language.'),
  audioDataUri: z
    .string()
    .describe('The data URI of the generated audio pronunciation.'),
});
export type IdentifyAndPronounceOutput = z.infer<
  typeof IdentifyAndPronounceOutputSchema
>;
