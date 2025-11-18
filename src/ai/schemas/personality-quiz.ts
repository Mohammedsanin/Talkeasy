
import { z } from 'genkit';

export const PersonalityQuizInputSchema = z.object({
  language: z.string().describe("The language the user wants to learn (e.g., 'en-US', 'hi-IN')."),
  motivation: z.string().describe("User's primary motivation (e.g., 'career', 'travel')."),
  learningStyle: z.string().describe("User's preferred learning style (e.g., 'visual', 'auditory')."),
  speakingConfidence: z.string().describe("A 1-5 rating of their speaking confidence."),
  mistakeAttitude: z.string().describe("How the user feels about making mistakes (e.g., 'cautious', 'adventurous')."),
  challengePreference: z.string().describe("The type of challenges the user prefers (e.g., 'fast', 'deep')."),
  lsrwComfort: z.string().describe("The skill (Listening, Speaking, Reading, Writing) the user feels most comfortable with."),
});
export type PersonalityQuizInput = z.infer<typeof PersonalityQuizInputSchema>;

export const PersonalityQuizOutputSchema = z.object({
  personalityType: z.enum(['Explorer', 'Challenger', 'Storyteller', 'Builder', 'Performer'])
    .describe('The determined personality type for the language learner.'),
  proficiencyLevel: z.enum(['Beginner', 'Lower Intermediate', 'Upper Intermediate', 'Advanced'])
    .describe('The estimated proficiency level of the user.'),
  report: z.string().describe("A short, one-sentence motivational report based on the user's personality."),
  skillAnalysis: z.string().describe("A brief, one-sentence analysis of the user's LSRW skills based on their preferences."),
  lsrw: z.object({
    listening: z.number().min(0).max(100),
    speaking: z.number().min(0).max(100),
    reading: z.number().min(0).max(100),
    writing: z.number().min(0).max(100),
  }).describe('An initial assessment of the user\'s Listening, Speaking, Reading, and Writing skills on a scale of 0-100.'),
});
export type PersonalityQuizOutput = z.infer<typeof PersonalityQuizOutputSchema>;
