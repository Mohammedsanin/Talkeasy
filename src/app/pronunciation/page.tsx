'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mic, MicOff, Send, Loader2, Wand2 } from 'lucide-react';
import type { PronunciationFeedbackOutput } from '@/ai/flows/pronunciation-feedback';
import { getPronunciationFeedbackAction, generatePracticeWordsAction } from '@/app/actions';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

const languages = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'english', label: 'English' },
];

const wordGenerationSchema = z.object({
  language: z.string().min(1, 'Please select a language.'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

export default function PronunciationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<PronunciationFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [practiceWords, setPracticeWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const wordGenerationForm = useForm<z.infer<typeof wordGenerationSchema>>({
    resolver: zodResolver(wordGenerationSchema),
    defaultValues: {
      language: 'english',
      difficulty: 'beginner',
    },
  });

  const startRecording = async () => {
    setAudioDataUri(null);
    setFeedback(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioDataUri(reader.result as string);
          };
        };
        
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
            variant: 'destructive',
            title: 'Microphone Error',
            description: 'Could not access the microphone. Please check your browser permissions.'
        })
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  async function onGenerateWords(values: z.infer<typeof wordGenerationSchema>) {
    setIsGenerating(true);
    setPracticeWords([]);
    setSelectedWord(null);
    setFeedback(null);
    setAudioDataUri(null);
    try {
      const result = await generatePracticeWordsAction(values);
      setPracticeWords(result.words);
      if (result.words.length > 0) {
        setSelectedWord(result.words[0]);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate practice words. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function onGetFeedback() {
    if (!audioDataUri || !selectedWord) {
      toast({
        variant: 'destructive',
        title: 'No audio recorded',
        description: 'Please record yourself speaking the selected word first.',
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await getPronunciationFeedbackAction({
        userAudio: audioDataUri,
        targetText: selectedWord,
        language: wordGenerationForm.getValues('language'),
      });
      setFeedback(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get pronunciation feedback. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleWordSelection = (word: string) => {
    setSelectedWord(word);
    setAudioDataUri(null);
    setFeedback(null);
    if (isRecording) {
        stopRecording();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Multi-language Pronunciation"
        description="Select a language and difficulty, then practice words generated by AI."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Practice Zone</CardTitle>
            <CardDescription>
              First, generate some words to practice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...wordGenerationForm}>
              <form
                onSubmit={wordGenerationForm.handleSubmit(onGenerateWords)}
                className="space-y-6"
              >
                <FormField
                  control={wordGenerationForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value} className="capitalize">{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={wordGenerationForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Difficulty Level</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="beginner" />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">Beginner</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="intermediate" />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">Intermediate</FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="advanced" />
                            </FormControl>
                            <FormLabel className="font-normal capitalize">Advanced</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Generate Words
                </Button>
              </form>
            </Form>

            {practiceWords.length > 0 && (
                <div className="mt-8">
                  <h3 className="mb-4 text-lg font-semibold">Practice These Words</h3>
                   <div className="flex flex-wrap gap-3">
                     {practiceWords.map(word => (
                        <Badge 
                            key={word}
                            variant={selectedWord === word ? 'default' : 'secondary'}
                            className="cursor-pointer text-base"
                            onClick={() => handleWordSelection(word)}
                        >
                            {word}
                        </Badge>
                     ))}
                   </div>
                   
                   <div className="mt-6 flex flex-col items-center gap-4 rounded-lg border bg-muted/30 p-6">
                      <p className="text-muted-foreground">Practice word:</p>
                      <p className="text-3xl font-bold font-headline text-primary">{selectedWord}</p>
                      <Button
                        type="button"
                        variant={isRecording ? 'destructive' : 'outline'}
                        size="lg"
                        onClick={handleToggleRecording}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        disabled={!selectedWord}
                      >
                        {isRecording ? (
                          <MicOff className="mr-2 animate-pulse" />
                        ) : (
                          <Mic className="mr-2" />
                        )}
                         {isRecording ? 'Stop Recording' : 'Recording...'}
                      </Button>
                      {audioDataUri && !isRecording && (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Your recording is ready.</p>
                            <audio controls src={audioDataUri} className="mt-2" />
                        </div>
                      )}
                   </div>

                   <Button onClick={onGetFeedback} disabled={isLoading || !audioDataUri} className="mt-6 w-full">
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Get Feedback
                    </Button>
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
            <CardDescription>
              Here&apos;s what our AI coach thinks of your pronunciation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p>Analyzing your speech...</p>
              </div>
            ) : feedback ? (
              <div className="w-full space-y-6">
                {feedback.spokenText && (
                    <div className='text-center'>
                        <p className="text-sm text-muted-foreground">You said:</p>
                        <p className="text-lg italic">&quot;{feedback.spokenText}&quot;</p>
                    </div>
                )}
                {feedback.score !== undefined && feedback.score !== null && (
                  <div className="text-center">
                    <p className="font-headline text-6xl font-bold text-primary">
                      {feedback.score}
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </p>
                    <p className="font-semibold text-muted-foreground">
                      Accuracy Score
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-4 rounded-md border bg-card p-4">
                  <Bot className="h-8 w-8 flex-shrink-0 text-primary" />
                  <p className="mt-1">{feedback.feedback}</p>
                </div>
              </div>
            ) : (
               <div className="text-center text-muted-foreground">
                <Bot className="mx-auto mb-4 h-12 w-12" />
                <p>Your feedback will appear here after you record and submit.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
