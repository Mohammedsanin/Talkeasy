'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lightbulb,
  Loader2,
  ClipboardList,
  Languages,
  Briefcase,
  Utensils,
  ShoppingCart,
  MessageCircle,
  MapPin,
  Plane,
  BedDouble,
  Stethoscope,
  Gavel,
} from 'lucide-react';
import { generateScenarioPhrasesAction } from '@/app/actions';
import type { ScenarioPhrasesOutput } from '@/ai/schemas/scenario-phrases';
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
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const languages = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
];

const scenarios = [
  { value: 'Job Interview', label: 'Job Interview', icon: <Briefcase className="mr-2 h-4 w-4" /> },
  { value: 'Restaurant', label: 'Restaurant', icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: 'Shopping', label: 'Shopping', icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
  { value: 'Asking for Directions', label: 'Asking for Directions', icon: <MapPin className="mr-2 h-4 w-4" /> },
  { value: 'At the Airport', label: 'At the Airport', icon: <Plane className="mr-2 h-4 w-4" /> },
  { value: 'At a Hotel', label: 'At a Hotel', icon: <BedDouble className="mr-2 h-4 w-4" /> },
  { value: 'Doctor\'s Appointment', label: 'Doctor\'s Appointment', icon: <Stethoscope className="mr-2 h-4 w-4" /> },
  { value: 'Local Laws & Rights', label: 'Local Laws & Rights', icon: <Gavel className="mr-2 h-4 w-4" /> },
  { value: 'General Conversation', label: 'General Conversation', icon: <MessageCircle className="mr-2 h-4 w-4" /> },
];

const formSchema = z.object({
  scenario: z.string().min(1, 'Please select a scenario.'),
  language: z.string().min(1, 'Please select a language.'),
});

export default function ScenarioPhrasesPage() {
  const [phrases, setPhrases] = useState<ScenarioPhrasesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scenario: 'Job Interview',
      language: 'hindi',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPhrases(null);
    try {
      const result = await generateScenarioPhrasesAction(values);
      setPhrases(result);
    } catch (error)
 {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate phrases. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Scenario-Based Phrases"
        description="Select a situation to learn key phrases for real-world conversations."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Scenario</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="scenario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scenario</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a scenario" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {scenarios.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <div className="flex items-center">
                                    {s.icon} {s.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                              <SelectItem key={lang.value} value={lang.value}>
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
                      <Lightbulb className="mr-2 h-4 w-4" />
                    )}
                    Get Phrases
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="min-h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ClipboardList className="text-primary"/>
                        Key Phrases
                    </CardTitle>
                     <CardDescription>
                       {phrases?.situation || 'Your phrases will appear here.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex h-full min-h-[400px] items-center justify-center">
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="text-lg">Generating phrases for you...</p>
                            </div>
                        </div>
                    )}
                    {phrases && (
                        <Accordion type="multiple" defaultValue={phrases.phraseCategories.map(c => c.categoryName)} className="w-full">
                            {phrases.phraseCategories.map(category => (
                                <AccordionItem value={category.categoryName} key={category.categoryName}>
                                    <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                        {category.categoryName}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                            {category.phrases.map(phrase => (
                                                <div key={phrase.phrase} className="rounded-md border bg-background p-3">
                                                    <p className="font-medium text-primary">{phrase.phrase}</p>
                                                    <p className="text-sm text-muted-foreground italic">"{phrase.translation}"</p>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                    {!isLoading && !phrases && (
                        <div className="flex h-full min-h-[400px] items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <Languages className="mx-auto mb-4 h-16 w-16" />
                                <p className="text-lg">Select a scenario and language to get started.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
