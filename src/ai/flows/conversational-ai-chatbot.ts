'use server';

/**
 * @fileOverview A conversational AI chatbot for language learning.
 *
 * - converse - A function that handles the conversation with the chatbot.
 * - ConverseInput - The input type for the converse function.
 * - ConverseOutput - The return type for the converse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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

const ConverseInputSchema = z.object({
  message: z.string().optional().describe('The user message to the chatbot.'),
  userAudio: z
    .string()
    .optional()
    .describe('The user\'s speech as audio data URI.'),
  language: z.string().describe('The language for the conversation.'),
  context: z.string().optional().describe('The context of the conversation.'),
});
export type ConverseInput = z.infer<typeof ConverseInputSchema>;

const ConverseOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
  audioResponse: z.string().describe('The data URI of the audio response.'),
});
export type ConverseOutput = z.infer<typeof ConverseOutputSchema>;

export async function converse(input: ConverseInput): Promise<ConverseOutput> {
  return converseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'conversePrompt',
  input: {schema: z.object({
    message: z.string(),
    language: z.string(),
    context: z.string().optional(),
  })},
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are a conversational AI chatbot designed to help users improve their listening and speaking abilities in {{language}}. Keep your responses friendly and relatively short.

  Context: {{{context}}}

  User: {{{message}}}
  Chatbot: `,
});

const converseFlow = ai.defineFlow(
  {
    name: 'converseFlow',
    inputSchema: ConverseInputSchema,
    outputSchema: ConverseOutputSchema,
  },
  async input => {
    let inputText = input.message;

    if (input.userAudio) {
      const {text: transcribedText} = await ai.generate({
        prompt: [{media: {url: input.userAudio}}],
        model: 'googleai/gemini-2.5-flash',
        config: {
          language: input.language
        }
      });
      inputText = transcribedText;
    }

    if (!inputText) {
      throw new Error('No text or audio provided for conversation.');
    }

    const {output} = await prompt({
      message: inputText,
      language: input.language,
      context: input.context,
    });
    
    if (!output?.response) {
      throw new Error('Could not generate a response.');
    }

    const {media: audioMedia} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: output.response,
    });

    if (!audioMedia?.url) {
      throw new Error('Failed to generate audio response.');
    }
    
    const audioBuffer = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      response: output.response,
      audioResponse: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
