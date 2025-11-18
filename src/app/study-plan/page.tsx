'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lightbulb,
  Loader2,
  CalendarCheck,
  BookOpen,
  Target,
  Youtube,
  Activity,
  Book,
} from 'lucide-react';
import { generateStudyPlanAction } from '@/app/actions';
import type { StudyPlanOutput } from '@/ai/flows/study-plan-flow';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const languages = [
  { value: 'hindi', label: 'Hindi' },
  { value: 'english', label: 'English' },
  { value: 'bengali', label: 'Bengali' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'marathi', label: 'Marathi' },
];

const formSchema = z.object({
  language: z.string().min(1, 'Please select a language.'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your proficiency level.',
  }),
  goals: z.string().min(3, 'Please describe your goals.'),
  weeklyHours: z.string().min(1, 'Please select your weekly commitment.'),
  interests: z.string().min(3, 'Please list some interests.'),
});

export default function StudyPlanPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: 'hindi',
      proficiency: 'beginner',
      goals: 'I want to have basic conversations for my trip next year.',
      weeklyHours: '3-5',
      interests: 'Watching movies and listening to music.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStudyPlan(null);
    try {
      const result = await generateStudyPlanAction(values);
      setStudyPlan(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to generate a study plan. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Personalized Study Plan"
        description="Answer a few questions to get a custom-made study plan from our AI coach."
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Profile</CardTitle>
              <CardDescription>
                Tell us about your learning style.
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
                  <FormField
                    control={form.control}
                    name="proficiency"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Proficiency</FormLabel>
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
                              <FormLabel className="font-normal capitalize">
                                Beginner
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="intermediate" />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                Intermediate
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="advanced" />
                              </FormControl>
                              <FormLabel className="font-normal capitalize">
                                Advanced
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="goals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Goals</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., travel, business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weeklyHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weekly Commitment</FormLabel>
                         <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select hours" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             <SelectItem value="1-2">1-2 hours</SelectItem>
                             <SelectItem value="3-5">3-5 hours</SelectItem>
                             <SelectItem value="5+">5+ hours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Interests</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., movies, music, books" {...field} />
                        </FormControl>
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
                    Generate My Plan
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
            <Card className="flex h-full min-h-[500px] items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg">Generating your personalized plan...</p>
              </div>
            </Card>
          )}
          {studyPlan && (
            <Card className="border-primary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <CalendarCheck className="text-primary"/>
                        Your 4-Week Study Plan
                    </CardTitle>
                    <CardDescription>Follow this plan to achieve your language goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-semibold"><Lightbulb/> Weekly Breakdown</h3>
                        <div className="space-y-6">
                            {studyPlan.weeklyPlan.map(week => (
                                <div key={week.week} className="rounded-lg border bg-muted/20 p-4">
                                    <p className="font-bold text-primary">Week {week.week}: {week.focus}</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                                        {week.activities.map((activity, i) => <li key={i}>{activity}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-semibold"><Target/> Long-Term Goals</h3>
                         <ul className="space-y-2 text-muted-foreground">
                            {studyPlan.longTermGoals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <Activity className="mt-1 h-4 w-4 flex-shrink-0 text-accent" />
                                    <span>{goal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Separator />
                    
                    <div>
                        <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-semibold"><BookOpen/> Recommended Resources</h3>
                        <div className="space-y-4">
                        {studyPlan.resources.map((resource, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Book className="mt-1 h-5 w-5 flex-shrink-0 text-accent" />
                                <div>
                                    <p className="font-semibold">{resource.name} <span className="text-xs text-muted-foreground">({resource.type})</span></p>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>

                    {studyPlan.youtubeRecommendations && studyPlan.youtubeRecommendations.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="mb-4 flex items-center gap-2 font-headline text-xl font-semibold">
                            <Youtube className="text-red-600" />
                            YouTube Recommendations
                          </h3>
                          <div className="space-y-4">
                            {studyPlan.youtubeRecommendations.map((video) => (
                              <a
                                key={video.videoId}
                                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                              >
                                <img
                                  src={`https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`}
                                  alt={video.title}
                                  className="aspect-video w-32 rounded-md object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold leading-tight">{video.title}</p>
                                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                </CardContent>
            </Card>
          )}
          {!isLoading && !studyPlan && (
            <Card className="flex h-full min-h-[500px] items-center justify-center">
              <div className="text-center text-muted-foreground">
                <CalendarCheck className="mx-auto mb-4 h-16 w-16" />
                <p className="text-lg">Your study plan will appear here.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
