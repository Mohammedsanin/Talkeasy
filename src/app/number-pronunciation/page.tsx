
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Sparkles, Volume2, ListOrdered, Copy } from 'lucide-react';
import { getNumberPronunciationAction } from '@/app/actions';
import type { NumberPronunciationOutput } from '@/ai/schemas/number-pronunciation';
import PageHeader from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const languages = [
  { value: 'en-US', label: 'English' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'mr-IN', label: 'Marathi' },
  { value: 'gu-IN', label: 'Gujarati' },
  { value: 'kn-IN', label: 'Kannada' },
  { value: 'ml-IN', label: 'Malayalam' },
];

const formSchema = z.object({
  number: z.coerce.number().int().min(0, 'Please enter a positive number.'),
  language: z.string().min(1, 'Please select a language.'),
});

export default function NumberPronunciationPage() {
  const [result, setResult] = useState<NumberPronunciationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number: 143,
      language: 'hi-IN',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getNumberPronunciationAction(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get pronunciation. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handlePlayAudio = () => {
    if (result?.audioDataUri) {
      const audio = new Audio(result.audioDataUri);
      audio.play();
    }
  };

  const handleCopyToClipboard = () => {
    if (!result?.writtenNumber) return;
    navigator.clipboard.writeText(result.writtenNumber);
    toast({
      title: 'Copied to clipboard!',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Number Pronunciation"
        description="Learn how to say numbers in different languages."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Number Input</CardTitle>
              <CardDescription>
                Enter a number and select a language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 42" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Get Pronunciation
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>
                The number in words and its pronunciation will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p>Generating pronunciation...</p>
                </div>
              )}
              {result ? (
                <div className="flex flex-col items-center gap-6 text-center">
                  <p className="text-sm text-muted-foreground">Number in {languages.find(l => l.value === form.getValues('language'))?.label}:</p>
                  <div className="relative">
                    <h3 className="text-4xl font-bold font-headline text-primary">
                      {result.writtenNumber}
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -right-10 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <p className="text-lg text-muted-foreground">
                    ({result.phoneticSpelling})
                  </p>

                  <Separator className="my-4" />
                  
                  <Button onClick={handlePlayAudio} variant="outline" size="lg" disabled={!result.audioDataUri}>
                    <Volume2 className="mr-2 h-5 w-5" />
                    Listen to Pronunciation
                  </Button>
                  {!result.audioDataUri && (
                    <p className="text-xs text-muted-foreground">Audio pronunciation is not available for this language yet.</p>
                  )}
                </div>
              ) : (
                !isLoading && (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
                    <ListOrdered className="mx-auto mb-4 h-12 w-12" />
                    <p>Your result will appear here.</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
