
'use server';

/**
 * @fileOverview Converts a number to its written form and provides audio pronunciation in a target language.
 *
 * - getNumberPronunciation - A function that handles the number pronunciation process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';
import {
  NumberPronunciationInputSchema,
  NumberPronunciationOutputSchema,
  type NumberPronunciationInput,
  type NumberPronunciationOutput,
} from '@/ai/schemas/number-pronunciation';


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

const numberConversionPrompt = ai.definePrompt({
  name: 'numberConversionPrompt',
  input: { schema: NumberPronunciationInputSchema },
  output: { schema: z.object({ writtenNumber: z.string(), phoneticSpelling: z.string() }) },
  prompt: `You are a linguistic assistant. For the given number, provide its written word form in the specified language and a simple, easy-to-understand phonetic spelling in English script.

Number: {{{number}}}
Language: {{{language}}}

Example for number 25 in Hindi:
{
  "writtenNumber": "पच्चीस",
  "phoneticSpelling": "Pach-chees"
}

Provide only the JSON object in your response.`,
});


const getNumberPronunciationFlow = ai.defineFlow(
  {
    name: 'getNumberPronunciationFlow',
    inputSchema: NumberPronunciationInputSchema,
    outputSchema: NumberPronunciationOutputSchema,
  },
  async (input) => {
    // 1. Get the written form and phonetic spelling
    const { output: conversionOutput } = await numberConversionPrompt(input);

    if (!conversionOutput?.writtenNumber) {
      throw new Error('Failed to convert number to text.');
    }
    
    let audioDataUri = '';
    let audioMedia;

    try {
        // 2. Generate audio for the translated name
        const result = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    languageCode: input.language.split('-')[0], // Pass the language code (e.g., 'hi' from 'hi-IN')
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' },
                    },
                },
            },
            prompt: conversionOutput.writtenNumber,
        });
        audioMedia = result.media;
    } catch (e) {
        console.warn(`Could not generate audio for language ${input.language}:`, e);
        // Fail gracefully, audio is not critical
    }


    if (audioMedia?.url) {
        const audioBuffer = Buffer.from(
            audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
            'base64'
        );
        const wavBase64 = await toWav(audioBuffer);
        audioDataUri = `data:audio/wav;base64,${wavBase64}`;
    }


    return {
      ...conversionOutput,
      audioDataUri: audioDataUri,
    };
  }
);


export async function getNumberPronunciation(
    input: NumberPronunciationInput
  ): Promise<NumberPronunciationOutput> {
    return getNumberPronunciationFlow(input);
}
