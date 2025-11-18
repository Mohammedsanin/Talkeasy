
import { z } from 'genkit';

export const StorytellingInputSchema = z.object({
  language: z.string().describe('The target language for the story, e.g., "Hindi".'),
  proficiency: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe("The user's proficiency level."),
});
export type StorytellingInput = z.infer<typeof StorytellingInputSchema>;

export const StorytellingOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  story: z.string().describe('The full text of the story, adapted for the proficiency level.'),
  audioNarrationUri: z.string().optional().describe('A data URI for the audio narration of the story.'),
  vocabulary: z.array(z.object({
      wordInStory: z.string().describe('The word as it appears in the story.'),
      baseForm: z.string().describe('The base or dictionary form of the word.'),
      definition: z.string().describe('A simple English definition.'),
    })).describe('A list of key vocabulary words from the story.'),
  comprehensionQuestion: z.object({
    question: z.string().describe('A question about the story.'),
    options: z.array(z.string()).describe('A list of possible answers.'),
    answer: z.string().describe('The correct answer.'),
  }).describe('A multiple-choice question to test comprehension.'),
  culturalNote: z.string().describe('A brief cultural note related to the story.'),
});
export type StorytellingOutput = z.infer<typeof StorytellingOutputSchema>;
