'use server';

/**
 * @fileOverview Generates a personalized study plan for language learners.
 *
 * - generateStudyPlan - A function that creates a study plan based on user input.
 * - StudyPlanInput - The input type for the generateStudyPlan function.
 * - StudyPlanOutput - The return type for the generateStudyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const searchYoutubeVideos = ai.defineTool(
  {
    name: 'searchYoutubeVideos',
    description: 'Searches YouTube for language learning videos.',
    inputSchema: z.object({
      query: z.string().describe('The search query, e.g., "Hindi for beginners" or "Advanced English vocabulary".'),
    }),
    outputSchema: z.object({
      videos: z.array(
        z.object({
          videoId: z.string(),
          title: z.string(),
          description: z.string(),
        })
      ),
    }),
  },
  async (input) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YouTube API key is not configured.');
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('q', `learn ${input.query}`);
    url.searchParams.append('type', 'video');
    url.searchParams.append('maxResults', '5');
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.statusText}`);
    }
    const data = await response.json();

    return {
      videos: data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
      })),
    };
  }
);


const StudyPlanInputSchema = z.object({
  language: z.string().describe('The language the user wants to learn.'),
  proficiency: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user\'s current proficiency level.'),
  goals: z.string().describe('The user\'s primary learning goals (e.g., conversation, travel, business).'),
  weeklyHours: z.string().describe('How many hours per week the user can study.'),
  interests: z.string().describe('The user\'s personal interests (e.g., movies, music, books).'),
});
export type StudyPlanInput = z.infer<typeof StudyPlanInputSchema>;

const StudyPlanOutputSchema = z.object({
  weeklyPlan: z.array(
    z.object({
      week: z.number().describe('The week number.'),
      focus: z.string().describe('The main focus for the week.'),
      activities: z.array(z.string()).describe('A list of learning activities for the week.'),
    })
  ).describe('A 4-week structured plan.'),
  longTermGoals: z.array(z.string()).describe('A list of achievable long-term goals.'),
  resources: z.array(
    z.object({
      type: z.string().describe('The type of resource (e.g., App, Website, Book).'),
      name: z.string().describe('The name of the resource.'),
      description: z.string().describe('A brief description of how to use the resource.'),
    })
  ).describe('A list of recommended learning resources.'),
  youtubeRecommendations: z.array(
    z.object({
      videoId: z.string(),
      title: z.string(),
      description: z.string(),
    })
  ).describe('A list of recommended YouTube videos for learning.'),
});
export type StudyPlanOutput = z.infer<typeof StudyPlanOutputSchema>;

export async function generateStudyPlan(
  input: StudyPlanInput
): Promise<StudyPlanOutput> {
  return studyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyPlanPrompt',
  input: { schema: StudyPlanInputSchema },
  output: { schema: StudyPlanOutputSchema },
  tools: [searchYoutubeVideos],
  prompt: `You are an expert language learning coach. Create a personalized 4-week study plan for a user based on their responses. The plan should be realistic, engaging, and tailored to their interests and goals.

User's Profile:
- Language to Learn: {{{language}}}
- Current Proficiency: {{{proficiency}}}
- Learning Goals: {{{goals}}}
- Weekly Commitment: {{{weeklyHours}}}
- Personal Interests: {{{interests}}}

Generate a detailed plan that includes a weekly breakdown with a specific focus and a list of activities. 
Also, provide a few long-term goals and a list of recommended learning resources (apps, websites, books, etc.) that align with their interests.
Crucially, use the 'searchYoutubeVideos' tool to find and recommend 3-5 relevant YouTube videos that match the user's language, proficiency, and interests. Include these in the 'youtubeRecommendations' field of the output.
The activities should be varied and cover speaking, listening, reading, and writing. Make the plan encouraging and motivational.`,
});

const studyPlanFlow = ai.defineFlow(
  {
    name: 'studyPlanFlow',
    inputSchema: StudyPlanInputSchema,
    outputSchema: StudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
