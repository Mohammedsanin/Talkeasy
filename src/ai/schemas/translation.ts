import { z } from 'genkit';

export const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLang: z.string().describe('The source language of the text.'),
  targetLang: z.string().describe('The target language for the translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

export const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;
