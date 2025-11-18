
'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/grammar-and-vocabulary-assistant.ts';
import '@/ai/flows/alphabets-tracing-and-studying.ts';
import '@/ai/flows/pronunciation-feedback.ts';
import '@/ai/flows/conversational-ai-chatbot.ts';
import '@/ai/flows/study-plan-flow.ts';
import '@/ai/flows/document-translator-flow.ts';
import '@/ai/flows/location-lesson-flow.ts';
import '@/ai/flows/image-to-speech.ts';
import '@/ai/flows/video-context-translator.ts';
import '@/ai/flows/scenario-phrases-flow.ts';
import '@/ai/flows/personality-quiz-flow.ts';
import '@/ai/flows/synthesize-speech.ts';
import '@/ai/flows/adaptive-tracing-difficulty.ts';
import '@/ai/flows/suggest-languages.ts';
import '@/ai/flows/storytelling-flow.ts';
import '@/ai/flows/translation-flow.ts';
import '@/ai/flows/number-pronunciation-flow.ts';
