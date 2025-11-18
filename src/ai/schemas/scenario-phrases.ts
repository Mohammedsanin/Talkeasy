import { z } from 'genkit';

export const ScenarioPhrasesInputSchema = z.object({
  scenario: z.string().describe('The real-world scenario, e.g., "Job Interview" or "Restaurant".'),
  language: z.string().describe('The target language for the phrases.'),
});
export type ScenarioPhrasesInput = z.infer<typeof ScenarioPhrasesInputSchema>;

export const ScenarioPhrasesOutputSchema = z.object({
  situation: z.string().describe('A brief, one-sentence description of the scenario.'),
  phraseCategories: z.array(
      z.object({
          categoryName: z.string().describe('The name of the phrase category, e.g., "Asking Questions" or "Common Responses".'),
          phrases: z.array(
              z.object({
                  phrase: z.string().describe('The suggested phrase in the target language.'),
                  translation: z.string().describe('The English translation of the phrase.'),
              })
          ),
      })
  ).describe('A list of phrase categories, each containing relevant phrases.'),
});
export type ScenarioPhrasesOutput = z.infer<typeof ScenarioPhrasesOutputSchema>;
