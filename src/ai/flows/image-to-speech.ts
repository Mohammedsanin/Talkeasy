'use server';

/**
 * @fileOverview An AI agent that identifies an object in an image and provides its name and pronunciation in a selected language.
 *
 * - identifyAndPronounce - A function that handles the image identification and speech generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import {
  IdentifyAndPronounceInputSchema,
  IdentifyAndPronounceOutputSchema,
  type IdentifyAndPronounceInput,
  type IdentifyAndPronounceOutput,
} from '@/ai/schemas/image-to-speech';


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

const identificationPrompt = ai.definePrompt({
  name: 'identificationPrompt',
  input: { schema: z.object({ imageDataUri: z.string() }) },
  output: { schema: z.object({ objectName: z.string() }) },
  prompt: `Identify the main object in the following image. Provide only the name of the object in English.

Image: {{media url=imageDataUri}}`,
});

const translationPrompt = ai.definePrompt({
  name: 'translationPronunciationPrompt',
  input: { schema: z.object({ objectName: z.string(), language: z.string() }) },
  output: { schema: z.object({ translatedName: z.string() }) },
  prompt: `Translate the following object name into {{language}}.

Object Name: {{{objectName}}}

Provide only the translated name.`,
});

const identifyAndPronounceFlow = ai.defineFlow(
  {
    name: 'identifyAndPronounceFlow',
    inputSchema: IdentifyAndPronounceInputSchema,
    outputSchema: IdentifyAndPronounceOutputSchema,
  },
  async (input) => {
    // 1. Identify the object in the image
    const { output: identificationOutput } = await identificationPrompt({
      imageDataUri: input.imageDataUri,
    });
    const objectName = identificationOutput?.objectName;

    if (!objectName) {
      throw new Error('Could not identify the object in the image.');
    }

    // 2. Translate the object name
    const { output: translationOutput } = await translationPrompt({
      objectName: objectName,
      language: input.language,
    });
    const translatedName = translationOutput?.translatedName;

    if (!translatedName) {
      throw new Error('Could not translate the object name.');
    }

    // 3. Generate audio for the translated name
    const { media: audioMedia } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: translatedName,
    });

    if (!audioMedia?.url) {
      throw new Error('Failed to generate audio pronunciation.');
    }

    const audioBuffer = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      objectName: objectName,
      translatedName: translatedName,
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

export async function identifyAndPronounce(
  input: IdentifyAndPronounceInput
): Promise<IdentifyAndPronounceOutput> {
  return identifyAndPronounceFlow(input);
}
