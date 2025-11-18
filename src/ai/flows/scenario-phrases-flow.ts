'use server';

/**
 * @fileOverview Generates contextual phrases for real-world scenarios.
 *
 * - generateScenarioPhrases - A function that creates a list of phrases based on a scenario.
 */

import { ai } from '@/ai/genkit';
import {
  ScenarioPhrasesInputSchema,
  ScenarioPhrasesOutputSchema,
  type ScenarioPhrasesInput,
  type ScenarioPhrasesOutput,
} from '@/ai/schemas/scenario-phrases';


export async function generateScenarioPhrases(input: ScenarioPhrasesInput): Promise<ScenarioPhrasesOutput> {
  return scenarioPhrasesFlow(input);
}


const prompt = ai.definePrompt({
  name: 'scenarioPhrasesPrompt',
  input: { schema: ScenarioPhrasesInputSchema },
  output: { schema: ScenarioPhrasesOutputSchema },
  prompt: `You are a language coach creating a set of useful phrases for a user learning a new language.
The user needs help with a specific real-world scenario.

Scenario: {{{scenario}}}
Language: {{{language}}}

Based on this, generate a list of helpful phrases.
1.  Provide a brief, one-sentence description of the situation.
2.  Group the phrases into logical categories (e.g., "Greetings", "Asking for the Bill", "Questions to Ask the Interviewer").
3.  For each phrase, provide the text in the target language ({{{language}}}) and its English translation.
4.  Generate at least 2-3 categories, each with 3-5 phrases.`,
});

const scenarioPhrasesFlow = ai.defineFlow(
  {
    name: 'scenarioPhrasesFlow',
    inputSchema: ScenarioPhrasesInputSchema,
    outputSchema: ScenarioPhrasesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
