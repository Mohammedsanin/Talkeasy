'use server';

/**
 * @fileOverview A flow for synthesizing speech from text.
 *
 * - synthesizeSpeech - A function that converts text to speech audio.
 * - SynthesizeSpeechInput - The input type for the synthesizeSpeech function.
 * - SynthesizeSpeechOutput - The return type for the synthesizeSpeech function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const SynthesizeSpeechInputSchema = z.object({
  text: z.string().describe('The text to synthesize into speech.'),
  lang: z.string().describe('The language of the text (e.g., "en", "hi").'),
});
export type SynthesizeSpeechInput = z.infer<typeof SynthesizeSpeechInputSchema>;

const SynthesizeSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The synthesized audio as a WAV data URI.'),
});
export type SynthesizeSpeechOutput = z.infer<typeof SynthesizeSpeechOutputSchema>;


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

const synthesizeSpeechFlow = ai.defineFlow(
    {
      name: 'synthesizeSpeechFlow',
      inputSchema: SynthesizeSpeechInputSchema,
      outputSchema: SynthesizeSpeechOutputSchema,
    },
    async ({text}) => {
      const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: text,
      });

      if (!media) {
        throw new Error('No audio media was generated.');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);

      return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
      };
    }
  );

export async function synthesizeSpeech(
  input: SynthesizeSpeechInput
): Promise<SynthesizeSpeechOutput> {
  return synthesizeSpeechFlow(input);
}
