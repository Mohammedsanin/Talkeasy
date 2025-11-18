'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Languages, Loader2, Sparkles, AlertTriangle, MessageSquare } from 'lucide-react';
import { videoContextTranslatorAction } from '@/app/actions';
import type { VideoContextTranslatorOutput } from '@/ai/flows/video-context-translator';
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
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
];

const formSchema = z.object({
  language: z.string().min(1, 'Please select a target language.'),
});

export default function VideoTranslatorPage() {
  const [result, setResult] = useState<VideoContextTranslatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoDataUri, setVideoDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'hindi',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 20MB limit for videos
    if (file.size > 20 * 1024 * 1024) {
        toast({
            variant: 'destructive',
            title: 'File Too Large',
            description: 'Please upload a video smaller than 20MB.',
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setVideoPreview(URL.createObjectURL(file));
      setVideoDataUri(dataUri);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!videoDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Video',
        description: 'Please upload a video first.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await videoContextTranslatorAction({
        videoDataUri: videoDataUri,
        language: values.language,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to process the video. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Video Context Translator"
        description="Upload a video of a situation to get helpful conversational phrases."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Video Upload</CardTitle>
              <CardDescription>
                Choose a video of a situation to analyze.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <FormLabel>Video File</FormLabel>
                    <Input
                      type="file"
                      accept="video/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="hidden"
                    />
                    <Card
                      className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed aspect-video cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {videoPreview ? (
                        <video src={videoPreview} controls className="w-full h-full rounded-md object-contain" />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <Upload className="mx-auto h-12 w-12" />
                          <p>Click to upload any video file</p>
                          <p className="text-xs">(Max 20MB)</p>
                        </div>
                      )}
                    </Card>
                  </div>

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Get phrases in</FormLabel>
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
                  <Button type="submit" disabled={isLoading || !videoDataUri} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze and Suggest Phrases
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
              <CardDescription>
                Helpful phrases for the situation will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p>Analyzing your video...</p>
                </div>
              )}
              {result ? (
                <div className="space-y-6">
                    <div className='text-center rounded-lg bg-muted/50 p-4'>
                        <p className="text-sm text-muted-foreground">Identified Situation:</p>
                        <h3 className="text-xl font-bold font-headline capitalize text-primary flex items-center justify-center gap-2">
                           <AlertTriangle/> {result.situation}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {result.suggestedPhrases.map((item, index) => (
                            <div key={index} className="rounded-md border p-4">
                                <p className="text-xs text-muted-foreground">{item.context}</p>
                                <p className="text-lg font-semibold text-primary">{item.phrase}</p>
                                <p className="text-sm text-muted-foreground italic">"{item.translation}"</p>
                            </div>
                        ))}
                    </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12" />
                    <p>
                      Your suggestions will appear here after analyzing a video.
                    </p>
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
