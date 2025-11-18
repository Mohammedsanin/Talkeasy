'use server';

/**
 * @fileOverview Suggests languages to learn based on other installed language apps.
 *
 * - suggestLanguages - A function that suggests languages based on installed apps.
 * - SuggestLanguagesInput - The input type for the suggestLanguages function.
 * - SuggestLanguagesOutput - The return type for the suggestLanguages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLanguagesInputSchema = z.object({
  installedApps: z
    .array(z.string())
    .describe('A list of names of language learning apps installed on the device.'),
});
export type SuggestLanguagesInput = z.infer<typeof SuggestLanguagesInputSchema>;

const SuggestLanguagesOutputSchema = z.object({
  suggestedLanguages: z
    .array(z.string())
    .describe('A list of suggested languages to learn.'),
});
export type SuggestLanguagesOutput = z.infer<typeof SuggestLanguagesOutputSchema>;

export async function suggestLanguages(input: SuggestLanguagesInput): Promise<SuggestLanguagesOutput> {
  return suggestLanguagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLanguagesPrompt',
  input: {schema: SuggestLanguagesInputSchema},
  output: {schema: SuggestLanguagesOutputSchema},
  prompt: `Suggest languages that the user might be interested in learning, based on the language learning apps they already have installed.

Installed Apps: {{installedApps}}

Suggest a list of languages the user might be interested in learning:`,
});

const suggestLanguagesFlow = ai.defineFlow(
  {
    name: 'suggestLanguagesFlow',
    inputSchema: SuggestLanguagesInputSchema,
    outputSchema: SuggestLanguagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
