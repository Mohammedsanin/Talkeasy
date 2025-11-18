'use server';

/**
 * @fileOverview Summarizes and translates document text.
 *
 * - documentTranslator - A function that summarizes and translates text.
 * - DocumentTranslatorInput - The input type for the documentTranslator function.
 * - DocumentTranslatorOutput - The return type for the documentTranslator function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentTranslatorInputSchema = z.object({
  text: z
    .string()
    .describe('The text content from the document to be processed.'),
  language: z.string().describe('The target language for the translation.'),
});
export type DocumentTranslatorInput = z.infer<
  typeof DocumentTranslatorInputSchema
>;

const DocumentTranslatorOutputSchema = z.object({
  translatedSummary: z
    .string()
    .describe('The summarized and translated version of the text.'),
});
export type DocumentTranslatorOutput = z.infer<
  typeof DocumentTranslatorOutputSchema
>;

export async function documentTranslator(
  input: DocumentTranslatorInput
): Promise<DocumentTranslatorOutput> {
  return documentTranslatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'documentTranslatorPrompt',
  input: { schema: DocumentTranslatorInputSchema },
  output: { schema: DocumentTranslatorOutputSchema },
  prompt: `You are an expert multilingual assistant. Your task is to first summarize the provided text and then translate that summary into the specified target language. The summary should be concise and capture the main points of the original text.

Source Text:
{{{text}}}

Target Language: {{{language}}}

Provide only the final translated summary.`,
});

const documentTranslatorFlow = ai.defineFlow(
  {
    name: 'documentTranslatorFlow',
    inputSchema: DocumentTranslatorInputSchema,
    outputSchema: DocumentTranslatorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
