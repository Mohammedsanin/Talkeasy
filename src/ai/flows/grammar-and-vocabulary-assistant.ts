'use server';

/**
 * @fileOverview Provides feedback on grammar and vocabulary in written text.
 *
 * - grammarAndVocabularyAssistant - A function that provides suggestions for grammar and vocabulary improvements.
 * - GrammarAndVocabularyAssistantInput - The input type for the grammarAndVocabularyAssistant function.
 * - GrammarAndVocabularyAssistantOutput - The return type for the grammarAndVocabularyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GrammarAndVocabularyAssistantInputSchema = z.object({
  text: z
    .string()
    .optional()
    .describe(
      'The text to be checked for grammar and vocabulary improvements.'
    ),
  userAudio: z
    .string()
    .optional()
    .describe(
      'The user\'s speech as audio data URI to be checked for grammar and vocabulary.'
    ),
  language: z.string().describe('The language of the text or speech.'),
});
export type GrammarAndVocabularyAssistantInput = z.infer<
  typeof GrammarAndVocabularyAssistantInputSchema
>;

const GrammarAndVocabularyAssistantOutputSchema = z.object({
  feedback: z
    .string()
    .describe(
      'Feedback on the text, including suggestions for grammar and vocabulary improvements.'
    ),
  audioFeedback: z
    .string()
    .describe('The data URI of the generated audio feedback.'),
});
export type GrammarAndVocabularyAssistantOutput = z.infer<
  typeof GrammarAndVocabularyAssistantOutputSchema
>;

export async function grammarAndVocabularyAssistant(
  input: GrammarAndVocabularyAssistantInput
): Promise<GrammarAndVocabularyAssistantOutput> {
  return grammarAndVocabularyAssistantFlow(input);
}

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

const prompt = ai.definePrompt({
  name: 'grammarAndVocabularyAssistantPrompt',
  input: {schema: z.object({text: z.string(), language: z.string()})},
  output: {schema: z.object({feedback: z.string()})},
  prompt: `You are a grammar and vocabulary assistant for a language learner.
Provide feedback and suggestions for improvement on the following text, which is in {{language}}.
The feedback should be concise and focus on correcting the grammar and improving vocabulary. Provide the corrected text directly.

Text: {{{text}}}

Feedback:`,
});

const grammarAndVocabularyAssistantFlow = ai.defineFlow(
  {
    name: 'grammarAndVocabularyAssistantFlow',
    inputSchema: GrammarAndVocabularyAssistantInputSchema,
    outputSchema: GrammarAndVocabularyAssistantOutputSchema,
  },
  async input => {
    let inputText = input.text;

    if (input.userAudio) {
      const {text: transcribedText} = await ai.generate({
        prompt: [{media: {url: input.userAudio}}],
        model: 'googleai/gemini-2.5-flash',
      });
      inputText = transcribedText;
    }

    if (!inputText) {
      throw new Error('No text or audio provided for analysis.');
    }

    const {output} = await prompt({
      text: inputText,
      language: input.language,
    });

    if (!output?.feedback) {
      throw new Error('Could not generate feedback.');
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
      prompt: output.feedback,
    });

    if (!audioMedia?.url) {
      throw new Error('Failed to generate audio feedback.');
    }

    const audioBuffer = Buffer.from(
      audioMedia.url.substring(audioMedia.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      feedback: output.feedback,
      audioFeedback: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
