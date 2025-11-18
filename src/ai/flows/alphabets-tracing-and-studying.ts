'use server';
/**
 * @fileOverview An AI agent that helps users learn different language alphabets with mouse pointer tracing.
 *
 * - alphabetLearning - A function that handles the alphabet learning process.
 * - AlphabetLearningInput - The input type for the alphabetLearning function.
 * - AlphabetLearningOutput - The return type for the alphabetLearning function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlphabetLearningInputSchema = z.object({
  language: z.string().describe('The language of the alphabet to learn.'),
  alphabetCharacter: z.string().describe('The specific character to trace and study.'),
  tracingDataUri: z
    .string()
    .describe(
      'A data URI representing the user\'s tracing of the alphabet character, including mouse pointer data and associated timestamps. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  additionalContext: z.string().optional().describe('Any additional context or instructions for the AI.'),
});
export type AlphabetLearningInput = z.infer<typeof AlphabetLearningInputSchema>;

const AlphabetLearningOutputSchema = z.object({
  feedback: z.string().describe('AI feedback on the user\'s tracing accuracy and suggestions for improvement.'),
  exampleWords: z.array(z.string()).describe('Example words using the alphabet character.'),
  relatedCharacters: z.array(z.string()).describe('Related characters or variations of the alphabet character.'),
});
export type AlphabetLearningOutput = z.infer<typeof AlphabetLearningOutputSchema>;

export async function alphabetLearning(input: AlphabetLearningInput): Promise<AlphabetLearningOutput> {
  return alphabetLearningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'alphabetLearningPrompt',
  input: {schema: AlphabetLearningInputSchema},
  output: {schema: AlphabetLearningOutputSchema},
  prompt: `You are an expert language tutor specializing in alphabet learning.

You will use the user's tracing data to provide feedback on their accuracy and suggest improvements.

Provide example words using the alphabet character and list related characters or variations.

Language: {{{language}}}
Alphabet Character: {{{alphabetCharacter}}}
Tracing Data: {{media url=tracingDataUri}}
Additional Context: {{{additionalContext}}}

Respond in a way that is encouraging and helpful for language learners.`,
});

const alphabetLearningFlow = ai.defineFlow(
  {
    name: 'alphabetLearningFlow',
    inputSchema: AlphabetLearningInputSchema,
    outputSchema: AlphabetLearningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
