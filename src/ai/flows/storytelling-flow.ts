
'use server';

/**
 * @fileOverview Generates cultural storytelling lessons for language learning.
 *
 * - generateStory - A function that creates a story lesson.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  StorytellingInputSchema,
  StorytellingOutputSchema,
  type StorytellingInput,
  type StorytellingOutput,
} from '@/ai/schemas/storytelling';
import wav from 'wav';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const storytellingPrompt = ai.definePrompt({
  name: 'storytellingPrompt',
  input: { schema: StorytellingInputSchema },
  output: { schema: StorytellingOutputSchema },
  prompt: `You are an expert storyteller and language tutor. Your task is to generate a short, culturally relevant story for a language learner.

Language: {{{language}}}
Proficiency: {{{proficiency}}}

Based on this, generate a complete story lesson:
1.  **Story**: Create a simple, engaging story (2-4 paragraphs) suitable for a {{{proficiency}}} learner. The story should be from the culture associated with the {{{language}}} (e.g., a Panchatantra tale for Hindi, a Tenali Raman story for Telugu).
2.  **Title**: Give the story a simple title.
3.  **Vocabulary**: Identify 3-4 key vocabulary words from the story. For each word, provide its form in the story, its base form, and a simple English definition.
4.  **Comprehension Question**: Ask one simple multiple-choice question to check understanding of the story. Provide 3 options, with one being the correct answer.
5.  **Cultural Note**: Provide one brief, interesting cultural note related to the story or its characters.

The entire output must be in a single JSON object.`,
});

const storytellingFlow = ai.defineFlow(
  {
    name: 'storytellingFlow',
    inputSchema: StorytellingInputSchema,
    outputSchema: StorytellingOutputSchema,
  },
  async (input) => {
    // 1. Generate the story content
    const { output: storyContent } = await storytellingPrompt(input);

    if (!storyContent || !storyContent.story) {
      throw new Error('Failed to generate story content.');
    }

    // 2. Generate audio for the story
    const { media: audioMedia } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: storyContent.story,
    });

    if (!audioMedia?.url) {
      throw new Error('Failed to generate audio narration.');
    }

    const audioBuffer = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    // 3. Return the complete lesson
    return {
      ...storyContent,
      audioNarrationUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);


export async function generateStory(
    input: StorytellingInput
  ): Promise<StorytellingOutput> {
    return storytellingFlow(input);
}
