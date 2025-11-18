'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Languages, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { identifyAndPronounceAction } from '@/app/actions';
import type { IdentifyAndPronounceOutput } from '@/ai/schemas/image-to-speech';
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
import { Separator } from '@/components/ui/separator';

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

export default function ImageToSpeechPage() {
  const [result, setResult] = useState<IdentifyAndPronounceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
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

    if (!file.type.startsWith('image/')) {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a valid image file.',
        });
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageDataUri(dataUri);
        setResult(null);
    };
    reader.readAsDataURL(file);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageDataUri) {
        toast({
            variant: 'destructive',
            title: 'No Image',
            description: 'Please upload an image first.',
        });
        return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const response = await identifyAndPronounceAction({
        imageDataUri: imageDataUri,
        language: values.language,
      });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to process the image. Please try again.',
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
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Visual Translator"
        description="Upload an image to see what it is and hear its name in another language."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Image Upload</CardTitle>
              <CardDescription>
                Choose an image of an object to identify.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                    <div className="space-y-2">
                        <FormLabel>Image File</FormLabel>
                        <Input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            disabled={isLoading}
                            className="hidden"
                        />
                        <Card 
                            className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed h-64 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <div className='relative w-full h-full'>
                                    <Image src={imagePreview} alt="Selected image preview" fill className='object-contain'/>
                                </div>
                            ) : (
                                <div className='text-center text-muted-foreground'>
                                    <Upload className="mx-auto h-12 w-12" />
                                    <p>Click to upload an image</p>
                                    <p className='text-xs'>(PNG, JPG, etc.)</p>
                                </div>
                            )}
                        </Card>
                    </div>

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Translate to</FormLabel>
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
                  <Button type="submit" disabled={isLoading || !imageDataUri} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Identify and Pronounce
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>AI Result</CardTitle>
              <CardDescription>
                The identified object and its pronunciation will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p>Analyzing your image...</p>
                </div>
              )}
              {result ? (
                <div className="flex flex-col items-center gap-6">
                    <p className="text-sm text-muted-foreground">Identified Object:</p>
                    <h3 className="text-3xl font-bold font-headline capitalize">{result.objectName}</h3>
                    <Separator/>
                    <p className="text-sm text-muted-foreground">Translation in {form.getValues('language')}:</p>
                    <h3 className="text-3xl font-bold font-headline text-primary capitalize">{result.translatedName}</h3>
                    <Button onClick={handlePlayAudio} variant="outline" size="lg">
                        <Volume2 className="mr-2 h-5 w-5"/>
                        Listen to Pronunciation
                    </Button>
                    {result.audioDataUri && <audio src={result.audioDataUri} className="hidden" controls />}
                </div>
              ) : (
                !isLoading && (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                    <Languages className="mx-auto mb-4 h-12 w-12" />
                    <p>
                      Your result will appear here after processing an image.
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
