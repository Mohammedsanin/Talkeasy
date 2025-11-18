'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookText, Loader2, Wand2, Mic, MicOff, Volume2 } from 'lucide-react';
import type { GrammarAndVocabularyAssistantOutput } from '@/ai/flows/grammar-and-vocabulary-assistant';
import { getGrammarFeedbackAction } from '@/app/actions';
import PageHeader from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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
];

const formSchema = z.object({
  text: z.string().optional(),
  language: z.string().min(1, 'Please select a language'),
});

export default function GrammarPage() {
  const [feedback, setFeedback] =
    useState<GrammarAndVocabularyAssistantOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [inputType, setInputType] = useState('text');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: 'he go to the store and buyed some apple. He were very happy.',
      language: 'hindi',
    },
  });

  const startRecording = async () => {
    setAudioDataUri(null);
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
          description:
            'Could not access the microphone. Please check your browser permissions.',
        });
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (inputType === 'text' && (!values.text || values.text.length < 10)) {
        form.setError('text', { message: 'Please enter at least 10 characters.' });
        return;
    }
    if (inputType === 'speech' && !audioDataUri) {
        toast({
            variant: 'destructive',
            title: 'No audio recorded',
            description: 'Please record your speech first.',
        });
        return;
    }
      
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await getGrammarFeedbackAction({
        text: inputType === 'text' ? values.text : undefined,
        userAudio: inputType === 'speech' ? audioDataUri! : undefined,
        language: values.language,
      });
      setFeedback(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get grammar feedback. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const handlePlayFeedback = () => {
    if (feedback?.audioFeedback) {
        const audio = new Audio(feedback.audioFeedback);
        audio.play();
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Grammar & Vocabulary Assistant"
        description="Write, paste, or speak text to get instant feedback and suggestions."
      />
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="md:col-span-1">
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem
                                key={lang.value}
                                value={lang.value}
                                className="capitalize"
                              >
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-3">
                  <Tabs value={inputType} onValueChange={setInputType}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Text Input</TabsTrigger>
                      <TabsTrigger value="speech">Speech Input</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="mt-4">
                      <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                placeholder="Type your text here..."
                                className="min-h-[150px] text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    <TabsContent value="speech" className="mt-4">
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/30 p-6">
                            <Button
                                type="button"
                                variant={isRecording ? 'destructive' : 'outline'}
                                size="lg"
                                onClick={handleToggleRecording}
                            >
                                {isRecording ? (
                                <MicOff className="mr-2 animate-pulse" />
                                ) : (
                                <Mic className="mr-2" />
                                )}
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Button>
                            {audioDataUri && !isRecording && (
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Your recording is ready.</p>
                                    <audio controls src={audioDataUri} className="mt-2 w-full max-w-xs" />
                                </div>
                            )}
                        </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Analyze
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p>Checking your input for improvements...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>AI Feedback</CardTitle>
                  <CardDescription>
                    Here are some suggestions to improve your writing.
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={handlePlayFeedback} disabled={!feedback.audioFeedback}>
                <Volume2 />
                <span className="sr-only">Play feedback</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none rounded-md bg-muted/50 p-4">
              {feedback.feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
