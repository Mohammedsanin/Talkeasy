'use server';

/**
 * @fileOverview Adjusts tracing difficulty based on user performance.
 *
 * - adjustTracingDifficulty - A function that determines tracing difficulty.
 * - AdjustTracingDifficultyInput - The input type for the adjustTracingDifficulty function.
 * - AdjustTracingDifficultyOutput - The return type for the adjustTracingDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustTracingDifficultyInputSchema = z.object({
  accuracy: z
    .number()
    .min(0)
    .max(1)
    .describe('The accuracy of the user tracing, from 0 to 1.'),
  speed: z
    .number()
    .min(0)
    .describe('The speed of the user tracing, in pixels per second.'),
  currentDifficulty: z
    .number()
    .min(1)
    .max(10)
    .describe('The current tracing difficulty level, from 1 to 10.'),
  languageProficiency:
    z.string().optional().describe('The language proficiency level of the user, e.g., beginner, intermediate, advanced.'),
});

export type AdjustTracingDifficultyInput = z.infer<
  typeof AdjustTracingDifficultyInputSchema
>;

const AdjustTracingDifficultyOutputSchema = z.object({
  newDifficulty: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'The new tracing difficulty level, adjusted based on user performance.'
    ),
  feedbackMessage: z
    .string()
    .describe('A personalized feedback message for the user.'),
});

export type AdjustTracingDifficultyOutput = z.infer<
  typeof AdjustTracingDifficultyOutputSchema
>;

export async function adjustTracingDifficulty(
  input: AdjustTracingDifficultyInput
): Promise<AdjustTracingDifficultyOutput> {
  return adjustTracingDifficultyFlow(input);
}

const adjustTracingDifficultyPrompt = ai.definePrompt({
  name: 'adjustTracingDifficultyPrompt',
  input: {schema: AdjustTracingDifficultyInputSchema},
  output: {schema: AdjustTracingDifficultyOutputSchema},
  prompt: `You are an AI tracing difficulty adjuster. You will receive data about the user's performance, including accuracy (0 to 1), speed (pixels per second), current difficulty level (1 to 10) and language proficiency level (beginner, intermediate, advanced) and you must use this information to determine a new difficulty level (1 to 10) and provide personalized feedback.

Accuracy: {{accuracy}}
Speed: {{speed}}
Current Difficulty: {{currentDifficulty}}
Language Proficiency: {{languageProficiency}}

Consider these rules when adjusting difficulty:
- If accuracy is high (> 0.8) and speed is good ( > 100), increase difficulty by 1.
- If accuracy is low (< 0.5) and speed is slow (< 50), decrease difficulty by 1.
- If accuracy is consistently low and speed is consistently slow over multiple attempts, decrease difficulty by 2. Add 'Consider practicing simpler strokes' to the feedback message.
- If the user is proficient in the language (e.g. intermediate, advanced), increase the difficulty slightly faster as compared to the user being a beginner.
- Never exceed the minimum (1) or maximum (10) difficulty levels.

Difficulty Adjustment:
Based on the user performance, the new difficulty level should be:

Feedback Message:
Provide a personalized feedback message to the user, encouraging them and providing tips for improvement.`, // eslint-disable-line
});

const adjustTracingDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustTracingDifficultyFlow',
    inputSchema: AdjustTracingDifficultyInputSchema,
    outputSchema: AdjustTracingDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustTracingDifficultyPrompt(input);
    return output!;
  }
);
