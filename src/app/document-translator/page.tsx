'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Loader2, Wand2, Languages, Upload } from 'lucide-react';
import { documentTranslatorAction } from '@/app/actions';
import type { DocumentTranslatorOutput } from '@/ai/flows/document-translator-flow';
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
import { Input } from '@/components/ui/input';
import * as pdfjs from 'pdfjs-dist';

// Configure the worker script path for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


const languages = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
];

const formSchema = z.object({
  text: z
    .string()
    .min(50, 'Please paste or upload at least 50 characters from your document.'),
  language: z.string().min(1, 'Please select a target language.'),
});

export default function DocumentTranslatorPage() {
  const [result, setResult] = useState<DocumentTranslatorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      language: 'hindi',
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        toast({
            variant: 'destructive',
            title: 'Invalid File Type',
            description: 'Please upload a valid PDF file.',
        });
        return;
    }

    setIsParsing(true);
    form.reset({ ...form.getValues(), text: ''});
    toast({ title: 'Parsing PDF...', description: 'Please wait while we extract the text.' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as any).str).join(' ');
        fullText += pageText + '\n\n';
      }
      form.setValue('text', fullText);
      toast({ title: 'Success', description: 'PDF text has been loaded into the text area.'});
    } catch (error) {
        console.error('Failed to parse PDF:', error);
        toast({
            variant: 'destructive',
            title: 'PDF Parsing Error',
            description: 'Could not extract text from the PDF. Please try another file or paste the text manually.',
        });
    } finally {
        setIsParsing(false);
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await documentTranslatorAction(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to process the document. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Document Translator"
        description="Paste content or upload a PDF to get a translated summary."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Source Document</CardTitle>
              <CardDescription>
                Paste text directly or upload a PDF document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className='space-y-2'>
                    <FormLabel>Upload PDF</FormLabel>
                    <div className='flex items-center gap-2'>
                      <Input
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isParsing || isLoading}
                        className='hidden'
                      />
                       <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isParsing || isLoading}
                        >
                          {isParsing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload PDF
                        </Button>
                        {isParsing && <p className="text-sm text-muted-foreground">Parsing...</p>}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Document Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste text here or upload a PDF above..."
                            className="min-h-[300px] text-base"
                            {...field}
                          />
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
                  <Button type="submit" disabled={isLoading || isParsing} className="w-full">
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Summarize & Translate
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="min-h-full">
            <CardHeader>
              <CardTitle>Translated Summary</CardTitle>
              <CardDescription>
                Your summarized and translated content will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p>Processing your document...</p>
                </div>
              )}
              {result ? (
                <div className="prose prose-sm max-w-none space-y-4 rounded-md bg-muted/50 p-4">
                  <div className="space-y-2">
                    <h3 className="flex items-center gap-2 font-headline text-lg font-semibold">
                      <Languages className="text-primary" />
                      Summary in {form.getValues('language')}
                    </h3>
                    <p>{result.translatedSummary}</p>
                  </div>
                </div>
              ) : (
                !isLoading && (
                  <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
                    <FileText className="mx-auto mb-4 h-12 w-12" />
                    <p>
                      Your result will appear here after processing.
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
