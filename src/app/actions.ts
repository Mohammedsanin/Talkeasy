
'use server';

import {
  getPronunciationFeedback,
  type PronunciationFeedbackInput,
  generatePracticeWords,
  type GeneratePracticeWordsInput,
} from '@/ai/flows/pronunciation-feedback';
import {
  grammarAndVocabularyAssistant,
  type GrammarAndVocabularyAssistantInput,
} from '@/ai/flows/grammar-and-vocabulary-assistant';
import {
  converse,
  type ConverseInput,
} from '@/ai/flows/conversational-ai-chatbot';
import {
  alphabetLearning,
  type AlphabetLearningInput,
} from '@/ai/flows/alphabets-tracing-and-studying';
import {
  generateStudyPlan,
  type StudyPlanInput,
} from '@/ai/flows/study-plan-flow';
import {
  documentTranslator,
  type DocumentTranslatorInput,
} from '@/ai/flows/document-translator-flow';
import {
    generateLocationLesson,
    type LocationLessonInput,
} from '@/ai/flows/location-lesson-flow';
import { identifyAndPronounce } from '@/ai/flows/image-to-speech';
import type { IdentifyAndPronounceInput } from '@/ai/schemas/image-to-speech';
import {
  videoContextTranslator,
  type VideoContextTranslatorInput,
} from '@/ai/flows/video-context-translator';
import {
  generateScenarioPhrases,
} from '@/ai/flows/scenario-phrases-flow';
import type { ScenarioPhrasesInput } from '@/ai/schemas/scenario-phrases';
import {
  personalityQuiz,
} from '@/ai/flows/personality-quiz-flow';
import type { PersonalityQuizInput } from '@/ai/schemas/personality-quiz';
import {
  synthesizeSpeech,
  type SynthesizeSpeechInput,
} from '@/ai/flows/synthesize-speech';
import {
  adjustTracingDifficulty,
  type AdjustTracingDifficultyInput,
} from '@/ai/flows/adaptive-tracing-difficulty';
import {
  suggestLanguages,
  type SuggestLanguagesInput,
} from '@/ai/flows/suggest-languages';
import { generateStory } from '@/ai/flows/storytelling-flow';
import type { StorytellingInput } from '@/ai/schemas/storytelling';
import { translateText } from '@/ai/flows/translation-flow';
import type { TranslateTextInput } from '@/ai/schemas/translation';
import { getNumberPronunciation } from '@/ai/flows/number-pronunciation-flow';
import type { NumberPronunciationInput } from '@/ai/schemas/number-pronunciation';


export async function getPronunciationFeedbackAction(
  input: PronunciationFeedbackInput
) {
  return await getPronunciationFeedback(input);
}

export async function generatePracticeWordsAction(
  input: GeneratePracticeWordsInput
) {
  return await generatePracticeWords(input);
}

export async function getGrammarFeedbackAction(
  input: GrammarAndVocabularyAssistantInput
) {
  return await grammarAndVocabularyAssistant(input);
}

export async function getChatbotResponseAction(input: ConverseInput) {
  try {
    const result = await converse(input);
    return result;
  } catch (e: any) {
    if (e.message?.includes('503 Service Unavailable')) {
      return {
        response:
          'Sorry, my AI brain is a bit overloaded right now. Please try again in a moment.',
        audioResponse: '',
      };
    }
    // Re-throw other errors
    throw e;
  }
}

export async function getAlphabetTracingFeedbackAction(
  input: AlphabetLearningInput
) {
  return await alphabetLearning(input);
}

export async function generateStudyPlanAction(input: StudyPlanInput) {
  return await generateStudyPlan(input);
}

export async function documentTranslatorAction(input: DocumentTranslatorInput) {
  return await documentTranslator(input);
}

export async function generateLocationLessonAction(input: LocationLessonInput) {
    return await generateLocationLesson(input);
}

export async function identifyAndPronounceAction(input: IdentifyAndPronounceInput) {
  return await identifyAndPronounce(input);
}

export async function videoContextTranslatorAction(input: VideoContextTranslatorInput) {
    return await videoContextTranslator(input);
}

export async function generateScenarioPhrasesAction(input: ScenarioPhrasesInput) {
    return await generateScenarioPhrases(input);
}

export async function personalityQuizAction(input: PersonalityQuizInput) {
    return await personalityQuiz(input);
}

export async function synthesizeSpeechAction(input: SynthesizeSpeechInput) {
  return await synthesizeSpeech(input);
}

export async function adjustTracingDifficultyAction(
  input: AdjustTracingDifficultyInput
) {
  return await adjustTracingDifficulty(input);
}

export async function suggestLanguagesAction(input: SuggestLanguagesInput) {
  return await suggestLanguages(input);
}

export async function generateStoryAction(input: StorytellingInput) {
  return await generateStory(input);
}

export async function translateTextAction(input: TranslateTextInput) {
  return await translateText(input);
}

export async function getNumberPronunciationAction(input: NumberPronunciationInput) {
    return await getNumberPronunciation(input);
}
