'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Send, User, Mic, MicOff, Volume2 } from 'lucide-react';
import { getChatbotResponseAction } from '@/app/actions';
import PageHeader from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'bot';
  text: string;
  audio?: string;
}

const languages = [
  { value: 'hi', label: 'Hindi' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'te', label: 'Telugu' },
  { value: 'mr', label: 'Marathi' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'en', label: 'English' },
];

const initialGreetings: { [key: string]: string } = {
  en: 'Hello! I am your AI language practice partner. How can I help you today?',
  hi: 'नमस्ते! मैं आपका एआई भाषा अभ्यास भागीदार हूं। मैं आज आपकी मदद कैसे कर सकता हूं?',
  bn: 'হ্যালো! আমি আপনার এআই ভাষা অনুশীলন সঙ্গী। আমি আজ আপনাকে কিভাবে সাহায্য করতে পারি?',
  ta: 'வணக்கம்! நான் உங்கள் AI மொழி பயிற்சி கூட்டாளி. நான் இன்று உங்களுக்கு எப்படி உதவ முடியும்?',
  te: 'నమస్కారం! నేను మీ AI భాషా అభ్యాస భాగస్వామిని. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?',
  mr: 'नमस्कार! मी तुमचा AI भाषा सराव भागीदार आहे. मी आज तुम्हाला कशी मदत करू शकतो?',
  gu: 'નમસ્તે! હું તમારો AI ભાષા અભ્યાસ ભાગીદાર છું. હું આજે તમારી કેવી રીતે મદદ કરી શકું?',
  kn: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI ಭಾಷಾ ಅಭ್ಯಾಸದ ಪಾಲುದಾರ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?',
  ml: 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI ഭാഷാ പരിശീലന പങ്കാളിയാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും?',
  pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ AI ਭਾਸ਼ਾ ਅਭਿਆસ ਸਾਥੀ ਹਾਂ। ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
};


const formSchema = z.object({
  message: z.string(),
  language: z.string(),
});

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      language: 'en',
    },
  });

  const selectedLanguage = form.watch('language');

  useEffect(() => {
    setMessages([
        {
            role: 'bot',
            text: initialGreetings[selectedLanguage] || initialGreetings['en'],
        }
    ]);
  }, [selectedLanguage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

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
            // After recording, automatically submit
             handleSubmit(reader.result as string);
          };
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access microphone. Please check permissions.',
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
  
  const handleSubmit = async (audioUri?: string) => {
    const textMessage = form.getValues('message');
    if (!textMessage && !audioUri) return;

    setIsLoading(true);
    if (textMessage) {
        const userMessage: Message = { role: 'user', text: textMessage };
        setMessages((prev) => [...prev, userMessage]);
    }
    form.reset({ ...form.getValues(), message: '' });

    try {
      const result = await getChatbotResponseAction({
        message: textMessage ? textMessage : undefined,
        userAudio: audioUri ? audioUri : undefined,
        language: form.getValues('language'),
        context: 'A friendly language learning conversation.',
      });
      // If voice was used, add the transcribed text as a user message
      if (audioUri && result.response) {
           const userMessage: Message = { role: 'user', text: result.response.split('\n\n**User:** ')[0] };
           // A bit of a hack to get the user's transcribed text, assuming the bot flow returns it
           // A better solution would be a dedicated transcription step client-side or a different flow
      }

      const botMessage: Message = { role: 'bot', text: result.response, audio: result.audioResponse };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get a response. Please try again.',
      });
      const botMessage: Message = { role: 'bot', text: "Sorry, I couldn't process that. Please try again." };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePlayAudio = (audioData?: string) => {
    if (audioData) {
        const audio = new Audio(audioData);
        audio.play();
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-8">
      <PageHeader
        title="Conversational AI Chatbot"
        description="Practice your listening and speaking skills in a real-life conversation."
      />
      <Card className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-4',
                    message.role === 'user' && 'justify-end'
                  )}
                >
                  {message.role === 'bot' && (
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'relative max-w-md rounded-lg p-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                     {message.role === 'bot' && message.audio && (
                        <button onClick={() => handlePlayAudio(message.audio)} className="absolute -bottom-3 -right-3 p-1 rounded-full bg-accent text-accent-foreground shadow-md">
                            <Volume2 className="h-4 w-4" />
                        </button>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar>
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2 rounded-lg bg-muted p-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(() => handleSubmit())}
                className="flex items-center gap-4"
              >
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder="Type your message..."
                          autoComplete="off"
                          disabled={isLoading || isRecording}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleToggleRecording} disabled={isLoading}>
                    {isRecording ? <MicOff /> : <Mic />}
                </Button>
                <Button type="submit" disabled={isLoading || isRecording || form.getValues('message').length === 0}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
