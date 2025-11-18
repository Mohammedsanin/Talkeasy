
'use server';

/**
 * @fileOverview Translates text from a source language to a target language.
 *
 * - translateText - A function that handles the translation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  TranslateTextInputSchema,
  TranslateTextOutputSchema,
  type TranslateTextInput,
  type TranslateTextOutput,
} from '@/ai/schemas/translation';

const translationPrompt = ai.definePrompt({
  name: 'translationPrompt',
  input: {
    schema: z.object({
      text: z.string(),
      sourceLang: z.string(),
      targetLang: z.string(),
    }),
  },
  output: { schema: z.object({ translatedText: z.string() }) },
  prompt: `Translate the following text from {{sourceLang}} to {{targetLang}}.

Text: {{{text}}}

Provide only the translated text. Do not include any other commentary or markdown.`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    // If source and target are the same, just return the original text.
    if (input.sourceLang.toLowerCase() === input.targetLang.toLowerCase()) {
      return { translatedText: input.text };
    }

    const { output } = await translationPrompt(input);
    if (!output) {
      throw new Error('Translation failed: The AI model did not return a response.');
    }
    return output;
  }
);

export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}
