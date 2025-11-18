
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRightLeft,
  Languages,
  Loader2,
  Volume2,
  Copy,
} from 'lucide-react';
import { translateTextAction, synthesizeSpeechAction } from '@/app/actions';
import type { TranslateTextOutput } from '@/ai/schemas/translation';
import PageHeader from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languagesList = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'kannada', label: 'Kannada' },
  { value: 'malayalam', label: 'Malayalam' },
  { value: 'punjabi', label: 'Punjabi' },
  { value: 'gujarati', label: 'Gujarati' },
];

const formSchema = z.object({
  text: z.string().min(1, 'Please enter text to translate.'),
  sourceLang: z.string(),
  targetLang: z.string(),
});

export default function TranslatePage() {
  const [result, setResult] = useState<TranslateTextOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      sourceLang: 'english',
      targetLang: 'hindi',
    },
  });

  const sourceLang = form.watch('sourceLang');
  const targetLang = form.watch('targetLang');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.sourceLang === values.targetLang) {
      toast({
        variant: 'destructive',
        title: 'Invalid Selection',
        description: 'Source and target languages cannot be the same.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);
    try {
      const response = await translateTextAction(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to translate the text. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSwapLanguages = () => {
    form.setValue('sourceLang', targetLang);
    form.setValue('targetLang', sourceLang);
  };

  const handlePlayAudio = async () => {
    if (!result?.translatedText) return;

    try {
      const langCode =
        languagesList.find((l) => l.value === targetLang)?.value.substring(0, 2) ||
        'en';
      const { audioDataUri } = await synthesizeSpeechAction({
        text: result.translatedText,
        lang: langCode,
      });
      const audio = new Audio(audioDataUri);
      audio.play();
    } catch (error) {
      console.error('Speech synthesis failed', error);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not play audio for the translated text.',
      });
    }
  };

  const handleCopyToClipboard = () => {
    if (!result?.translatedText) return;
    navigator.clipboard.writeText(result.translatedText);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Translate"
        description="Translate text between different languages with ease."
      />
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Text to Translate ({sourceLang})
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter text..."
                          className="min-h-[200px] text-base"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                   <FormLabel>
                        Translated Text ({targetLang})
                    </FormLabel>
                  <div className="relative min-h-[200px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-base">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Translating...
                      </div>
                    ) : (
                      <p>{result?.translatedText}</p>
                    )}
                  </div>
                  {result && (
                     <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={handlePlayAudio}>
                            <Volume2 className="h-4 w-4" />
                            <span className="sr-only">Listen</span>
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={handleCopyToClipboard}>
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy</span>
                        </Button>
                     </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex w-full items-center gap-2">
                  <FormField
                    control={form.control}
                    name="sourceLang"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Source Language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languagesList.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSwapLanguages}
                  >
                    <ArrowRightLeft className="h-5 w-5" />
                  </Button>

                  <FormField
                    control={form.control}
                    name="targetLang"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Target Language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languagesList.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Languages className="mr-2 h-4 w-4" />
                  )}
                  Translate
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
