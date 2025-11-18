
'use server';

/**
 * @fileOverview An AI agent that analyzes a user's quiz answers to determine their language learning personality and proficiency level.
 *
 * - personalityQuiz - A function that handles the analysis.
 */

import { ai } from '@/ai/genkit';
import {
  PersonalityQuizInputSchema,
  PersonalityQuizOutputSchema,
  type PersonalityQuizInput,
  type PersonalityQuizOutput
} from '@/ai/schemas/personality-quiz';


const prompt = ai.definePrompt({
  name: 'personalityQuizPrompt',
  input: { schema: PersonalityQuizInputSchema },
  output: { schema: PersonalityQuizOutputSchema },
  prompt: `You are an AI language learning coach. Your task is to analyze a user's quiz responses and generate a personalized learning profile.

Analyze the following user data:
- Motivation: {{{motivation}}}
- Preferred Style: {{{learningStyle}}}
- Speaking Confidence (1-5): {{{speakingConfidence}}}
- Attitude to Mistakes: {{{mistakeAttitude}}}
- Challenge Preference: {{{challengePreference}}}
- Strongest Skill: {{{lsrwComfort}}}

Based on this, determine their **Personality Type** from these options:
- **Explorer**: Motivated by travel, enjoys visual learning, adventurous with mistakes.
- **Challenger**: Motivated by career, enjoys fast challenges, competitive.
- **Storyteller**: Motivated by communication, enjoys creative/writing tasks.
- **Builder**: Motivated by structured learning, prefers deep explanations, cautious with mistakes.
- **Performer**: High speaking confidence, enjoys speaking tasks, motivated by confidence.

Then, estimate their **Proficiency Level**:
- Speaking confidence 1-2 suggests 'Beginner'.
- Confidence 3 suggests 'Lower Intermediate'.
- Confidence 4 suggests 'Upper Intermediate'.
- Confidence 5 suggests 'Advanced'.

Then, generate an initial **LSRW Skill Meter** (0-100):
- Set the user's strongest skill (lsrwComfort) to a baseline of 40.
- If their preferred style is 'auditory', boost listening. If 'speaking', boost speaking. If 'writing', boost writing.
- If their confidence is low (1-2), keep the speaking score low (around 20-30). If high (4-5), boost it (50-60).
- Keep all other scores at a baseline of 20-30 to start.

Finally, write:
1.  A short, encouraging **personality report** (one sentence).
2.  A brief **skill analysis** explaining the LSRW meter (one sentence).

Example Output for a travel-motivated, visual learner with high confidence:
{
  "personalityType": "Explorer",
  "proficiencyLevel": "Upper Intermediate",
  "report": "Your adventurous spirit makes you a natural Explorer, ready to discover new worlds through language!",
  "skillAnalysis": "Your confidence in speaking gives you a great starting point, with plenty of room to grow in other areas.",
  "lsrw": { "listening": 30, "speaking": 55, "reading": 25, "writing": 20 }
}`,
});

export const personalityQuiz = ai.defineFlow(
  {
    name: 'personalityQuizFlow',
    inputSchema: PersonalityQuizInputSchema,
    outputSchema: PersonalityQuizOutputSchema,
  },
  async (input: PersonalityQuizInput): Promise<PersonalityQuizOutput> => {
    const { output } = await prompt(input);
    return output!;
  }
);
