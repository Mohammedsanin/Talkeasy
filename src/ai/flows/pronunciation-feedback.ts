'use server';

/**
 * @fileOverview Provides real-time feedback on pronunciation using voice recognition.
 *
 * - getPronunciationFeedback - A function that provides pronunciation feedback.
 * - PronunciationFeedbackInput - The input type for the getPronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the getPronunciationFeedback function.
 * - generatePracticeWords - A function that generates practice words.
 * - GeneratePracticeWordsInput - The input type for the generatePracticeWords function.
 * - GeneratePracticeWordsOutput - The return type for the generatePracticeWords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schema for generating practice words
const GeneratePracticeWordsInputSchema = z.object({
  language: z.string().describe('The language for which to generate words.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('The difficulty level of the words to generate.'),
});
export type GeneratePracticeWordsInput = z.infer<typeof GeneratePracticeWordsInputSchema>;

const GeneratePracticeWordsOutputSchema = z.object({
  words: z.array(z.string()).describe('A list of 5 to 10 words for pronunciation practice.'),
});
export type GeneratePracticeWordsOutput = z.infer<typeof GeneratePracticeWordsOutputSchema>;


// Schema for getting pronunciation feedback
const PronunciationFeedbackInputSchema = z.object({
  userAudio: z
    .string()
    .describe(
      "The user's speech as audio data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetText: z
    .string()
    .describe('The text the user is trying to pronounce correctly.'),
  language: z
    .string()
    .describe('The language of the text, e.g., Hindi, English, etc.'),
});
export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe('Feedback on the user\'s pronunciation, including specific areas for improvement.'),
  score: z
    .number()
    .optional()
    .describe('An optional numerical score indicating the accuracy of the pronunciation.'),
  spokenText: z.string().optional().describe('The text transcribed from the user\'s audio.'),
});
export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;


// Flow and exported function for generating words
const generateWordsPrompt = ai.definePrompt({
  name: 'generateWordsPrompt',
  input: {schema: GeneratePracticeWordsInputSchema},
  output: {schema: GeneratePracticeWordsOutputSchema},
  prompt: `You are a language tutor. Generate a list of 5 to 10 practice words for a user to practice their pronunciation.

Language: {{{language}}}
Difficulty: {{{difficulty}}}

The words should be appropriate for the specified difficulty level.`,
});

const generateWordsFlow = ai.defineFlow(
  {
    name: 'generateWordsFlow',
    inputSchema: GeneratePracticeWordsInputSchema,
    outputSchema: GeneratePracticeWordsOutputSchema,
  },
  async input => {
    const {output} = await generateWordsPrompt(input);
    return output!;
  }
);

export async function generatePracticeWords(input: GeneratePracticeWordsInput): Promise<GeneratePracticeWordsOutput> {
  return generateWordsFlow(input);
}


// Flow and exported function for pronunciation feedback
const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {schema: z.object({
    spokenText: z.string(),
    targetText: z.string(),
    language: z.string(),
  })},
  output: {schema: z.object({
    feedback: z.string(),
    score: z.number().optional(),
  })},
  prompt: `You are an AI pronunciation coach providing feedback to language learners.

  The user is trying to pronounce the following text in {{language}}:
  "{{targetText}}"

  The user actually spoke:
  "{{spokenText}}"

  Provide detailed feedback on the user's pronunciation, including specific sounds or words they struggled with.
  If the pronunciation was good, provide positive feedback and encouragement.  Include an optional numerical score (0-100) to indicate accuracy.
  Be encouraging, helpful and positive.
  `,
});


const pronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'pronunciationFeedbackFlow',
    inputSchema: PronunciationFeedbackInputSchema,
    outputSchema: PronunciationFeedbackOutputSchema,
  },
  async (input) => {
    // First, transcribe the audio
    const { text: spokenText } = await ai.generate({
      prompt: [{ media: { url: input.userAudio } }],
      model: 'googleai/gemini-2.5-flash',
    });

    if (!spokenText) {
      return {
        feedback: "Sorry, I couldn't understand what you said. Please try again.",
        score: 0,
        spokenText: '',
      }
    }

    // Then, get feedback on the pronunciation
    const { output } = await pronunciationFeedbackPrompt({
      spokenText,
      targetText: input.targetText,
      language: input.language,
    });
    
    return {
        ...output!,
        spokenText
    };
  }
);

export async function getPronunciationFeedback(input: PronunciationFeedbackInput): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}
