

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  Loader2,
  Sparkles,
  BookOpen,
  Mic,
  Pen,
  Headphones,
  Map,
  ChevronRight,
  Zap,
  Star,
  CheckCircle2,
  X,
  Languages,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { personalityQuizAction, synthesizeSpeechAction, translateTextAction } from '../actions';
import { PersonalityQuizOutput } from '@/ai/schemas/personality-quiz';
import { cn } from '@/lib/utils';
import { levels, Level, Task } from '@/config/levels';
import {
  ListeningTask,
  SpeakingTask,
  ReadingTask,
  WritingTask,
} from '@/components/level-tasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languagesList = [
  { value: 'en-US', label: 'English' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'bn-IN', label: 'Bengali' },
  { value: 'ta-IN', label: 'Tamil' },
  { value: 'te-IN', label: 'Telugu' },
  { value: 'mr-IN', label: 'Marathi' },
];

const questions = [
  {
    id: 'language',
    question: 'First, which language do you want to learn?',
    options: languagesList,
  },
  {
    id: 'motivation',
    question:
      'If you were learning a superpower language, why would you choose it?',
    options: [
      {
        value: 'career',
        label: 'To get a promotion at the Intergalactic Council.',
      },
      { value: 'travel', label: 'To explore hidden galaxies and talk to aliens.' },
      {
        value: 'communication',
        label: 'To connect with my new half-alien family.',
      },
      {
        value: 'confidence',
        label: 'To boldly give speeches in any corner of the universe.',
      },
    ],
  },
  {
    id: 'learningStyle',
    question: 'Choose your ideal training method:',
    options: [
      { value: 'visual', label: 'Holographic flashcards and mind maps' },
      { value: 'auditory', label: 'Listening to alien podcast debates' },
      { value: 'writing', label: 'Writing my own starship captain’s log' },
      { value: 'speaking', label: 'Practicing speeches with a robot sidekick' },
    ],
  },
  {
    id: 'speakingConfidence',
    question: 'Rate your speaking confidence from 🌑 (shy) to 🌕 (bold).',
    type: 'slider',
    options: [
      { value: '1', label: '🌑' },
      { value: '2', label: '🌒' },
      { value: '3', label: '🌓' },
      { value: '4', label: '🌔' },
      { value: '5', label: '🌕' },
    ],
  },
  {
    id: 'mistakeAttitude',
    question: 'If mistakes were space coins, how rich would you be today?',
    options: [
      {
        value: 'cautious',
        label: 'Just a few coins, I double-check everything.',
      },
      { value: 'balanced', label: 'A respectable pile. I learn from them.' },
      {
        value: 'adventurous',
        label: 'I own a planet made of coins! I try everything.',
      },
    ],
  },
  {
    id: 'challengePreference',
    question: 'What kind of mission gets you excited?',
    options: [
      { value: 'fast', label: 'Quick, rapid-fire challenges' },
      { value: 'deep', label: 'Deep dives into complex grammar rules' },
      { value: 'creative', label: 'Creative storytelling quests' },
    ],
  },
  {
    id: 'lsrwComfort',
    question: 'Which skill do you feel is your strongest right now?',
    options: [
      { value: 'listening', label: 'Listening' },
      { value: 'speaking', label: 'Speaking' },
      { value: 'reading', label: 'Reading' },
      { value: 'writing', label: 'Writing' },
    ],
  },
];

const quizSchema = z.object({
  language: z.string({ required_error: 'Please select a language.' }),
  motivation: z.string({ required_error: 'Please select an option.' }),
  learningStyle: z.string({ required_error: 'Please select an option.' }),
  speakingConfidence: z.string(),
  mistakeAttitude: z.string({ required_error: 'Please select an option.' }),
  challengePreference: z.string({ required_error: 'Please select an option.' }),
  lsrwComfort: z.string({ required_error: 'Please select an option.' }),
});

const personalityIcons: Record<string, React.ReactNode> = {
  Explorer: <Map className="h-8 w-8" />,
  Challenger: <Zap className="h-8 w-8" />,
  Storyteller: <BookOpen className="h-8 w-8" />,
  Builder: <Pen className="h-8 w-8" />,
  Performer: <Mic className="h-8 w-8" />,
};

const taskIcons: Record<string, React.ReactNode> = {
  L: <Headphones className="h-6 w-6 text-blue-400" />,
  S: <Mic className="h-6 w-6 text-green-400" />,
  R: <BookOpen className="h-6 w-6 text-orange-400" />,
  W: <Pen className="h-6 w-6 text-purple-400" />,
};

const LevelDetailView = ({
  level,
  onTaskComplete,
  completedTasks,
  language,
}: {
  level: Level;
  onTaskComplete: (taskId: string) => void;
  completedTasks: Set<string>;
  language: string;
}) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [processedTask, setProcessedTask] = useState<Task | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTaskClick = async (task: Task) => {
    if (completedTasks.has(task.id)) return;
    
    setIsProcessing(true);
    setActiveTask(task);

    const langInfo = languagesList.find(l => l.value === language);
    const targetLang = langInfo?.label.toLowerCase() || 'english';
    const langCode = langInfo?.value.split('-')[0] || 'en';
    
    let finalTask = { ...task };
    let translatedContent = { ...task.content };

    try {
      // Translate relevant text fields if the target language is not English
      if (targetLang !== 'english') {
        const toTranslate: {key: keyof typeof translatedContent, text: string}[] = [];
        if (task.content.textToSpeak) toTranslate.push({key: 'textToSpeak', text: task.content.textToSpeak});
        if (task.content.phrase) toTranslate.push({key: 'phrase', text: task.content.phrase});
        if (task.content.question) toTranslate.push({key: 'question', text: task.content.question});
        if (task.content.answer) toTranslate.push({key: 'answer', text: task.content.answer});
        if (task.content.options) {
            task.content.options.forEach((opt: string, i: number) => toTranslate.push({key: `option_${i}` as any, text: opt}));
        }

        const translationPromises = toTranslate.map(item => 
            translateTextAction({ text: item.text, sourceLang: 'english', targetLang: targetLang })
        );

        const translations = await Promise.all(translationPromises);
        
        const newOptions: string[] = [];
        toTranslate.forEach((item, index) => {
            const translatedText = translations[index].translatedText;
            if (item.key.toString().startsWith('option_')) {
                newOptions.push(translatedText);
            } else {
                translatedContent[item.key] = translatedText;
            }
        });
        if (newOptions.length > 0) {
            translatedContent.options = newOptions;
        }
      }

      finalTask.content = translatedContent;

      // Synthesize speech for the (now translated) text
      const textToSynthesize = translatedContent.textToSpeak || translatedContent.phrase;
      if (textToSynthesize) {
          const { audioDataUri } = await synthesizeSpeechAction({ text: textToSynthesize, lang: langCode });
          finalTask.content.audioDataUri = audioDataUri;
      }
    
      setProcessedTask(finalTask);

    } catch (e) {
        console.error("Task processing failed", e);
        toast({
            variant: "destructive",
            title: "Task Error",
            description: "Could not prepare the task. Please try again."
        });
        setProcessedTask(null);
        setActiveTask(null);
    } finally {
        setIsProcessing(false);
    }
  };


  const handleTaskComplete = (taskId: string) => {
    onTaskComplete(taskId);
    setActiveTask(null);
    setProcessedTask(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="text-primary" /> Level {level.level}: {level.name}
        </CardTitle>
        <CardDescription>
          Complete all tasks to unlock the next level!
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {level.tasks.map((task) => {
          const isCompleted = completedTasks.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => handleTaskClick(task)}
              disabled={isCompleted || (!!activeTask && task.id === activeTask.id && isProcessing)}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-all hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60',
                isCompleted
                  ? 'border-green-500/50 bg-green-500/10'
                  : 'border-border'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {taskIcons[task.type as keyof typeof taskIcons]}
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                </div>
                 {(!!activeTask && task.id === activeTask.id && isProcessing) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <span className="text-xs font-bold text-amber-500">
                    +{task.xp} XP
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </CardContent>
      <Dialog
        open={!!activeTask}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveTask(null);
            setProcessedTask(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{activeTask?.title}</DialogTitle>
            <DialogDescription>{activeTask?.description}</DialogDescription>
          </DialogHeader>
          {isProcessing || !processedTask ? (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {processedTask.type === 'L' && (
                <ListeningTask
                  task={processedTask}
                  onComplete={handleTaskComplete}
                  language={language}
                />
              )}
              {processedTask.type === 'S' && (
                <SpeakingTask
                  task={processedTask}
                  onComplete={handleTaskComplete}
                  language={language}
                />
              )}
              {processedTask.type === 'R' && (
                <ReadingTask task={processedTask} onComplete={handleTaskComplete} />
              )}
              {processedTask.type === 'W' && (
                <WritingTask task={processedTask} onComplete={handleTaskComplete} />
              )}
            </>
          )}

          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default function GamifiedLessonsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [quizResult, setQuizResult] = useState<PersonalityQuizOutput | null>(
    null
  );
  const [userLevel, setUserLevel] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const { toast } = useToast();

  const form = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      language: '',
      motivation: '',
      learningStyle: '',
      speakingConfidence: '3',
      mistakeAttitude: '',
      challengePreference: '',
      lsrwComfort: '',
    },
  });

  const selectedLanguage = form.watch('language');

  const handleNext = async () => {
    const field = questions[currentStep].id as keyof z.infer<typeof quizSchema>;
    const isValid = await form.trigger(field);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: z.infer<typeof quizSchema>) => {
    setIsLoading(true);
    try {
      const result = await personalityQuizAction(data);
      setQuizResult(result);
      setSelectedLevel(levels.find((l) => l.level === userLevel) || null);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Analyzing Quiz',
        description: 'Could not process your results. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setCompletedTasks((prev) => new Set(prev).add(taskId));
  };

  const handleLevelUp = () => {
    const nextLevel = userLevel + 1;
    if (nextLevel > 20) return;
    setUserLevel(nextLevel);
    setSelectedLevel(levels.find((l) => l.level === nextLevel) || null);
    setCompletedTasks(new Set()); // Reset tasks for the new level
  };

  const currentLevelTasks = levels.find((l) => l.level === userLevel)?.tasks || [];
  const allTasksForCurrentLevelCompleted = currentLevelTasks.every((task) =>
    completedTasks.has(task.id)
  );

  const handleLevelSelect = (level: Level) => {
    if (level.level === userLevel) {
      setSelectedLevel(level);
    } else {
      toast({
        title: level.level > userLevel ? 'Level Locked' : 'Level Complete',
        description:
          level.level > userLevel
            ? 'Complete your current level to unlock this one.'
            : "You've already mastered this level!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="font-headline text-2xl">Analyzing your personality...</h2>
        <p className="text-muted-foreground">
          Our AI is creating your personalized learning path!
        </p>
      </div>
    );
  }

  if (quizResult) {
    const {
      personalityType,
      proficiencyLevel,
      skillAnalysis,
      lsrw,
      report,
    } = quizResult;
    const proficiencyColor =
      proficiencyLevel === 'Beginner'
        ? 'text-green-400'
        : proficiencyLevel.includes('Intermediate')
          ? 'text-yellow-400'
          : 'text-red-400';
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Your Personalized Learning Path"
          description="Welcome! Here's your unique profile and game plan."
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="bg-gradient-to-br from-card to-card/70 text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/10 text-primary">
                  {personalityIcons[personalityType] || <Star />}
                </div>
                <CardTitle className="font-headline text-3xl text-primary">
                  {personalityType}
                </CardTitle>
                <CardDescription className={cn('font-bold', proficiencyColor)}>
                  {proficiencyLevel}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="italic text-muted-foreground">"{report}"</p>
                <div className="space-y-3 pt-4">
                  <h4 className="font-semibold">Skill Meters</h4>
                  {Object.entries(lsrw).map(([skill, value]) => (
                    <div key={skill} className="text-left">
                      <span className="text-sm font-medium capitalize">
                        {skill}
                      </span>
                      <Progress
                        value={value}
                        className="h-3 bg-primary/20 [&>div]:bg-accent"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{skillAnalysis}</p>
              </CardContent>
            </Card>
            {selectedLevel && (
              <CardFooter className="flex-col gap-4">
                <Button
                  onClick={handleLevelUp}
                  disabled={
                    userLevel >= 20 || !allTasksForCurrentLevelCompleted
                  }
                >
                  Level Up <ChevronRight className="h-4 w-4" />
                </Button>
                {!allTasksForCurrentLevelCompleted && (
                  <p className="text-xs text-muted-foreground">
                    Complete all tasks to level up!
                  </p>
                )}
              </CardFooter>
            )}
          </div>
          <div className="lg:col-span-2">
            {selectedLevel ? (
              <LevelDetailView
                level={selectedLevel}
                onTaskComplete={handleTaskComplete}
                completedTasks={completedTasks}
                language={selectedLanguage}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="text-primary" /> Level Map
                  </CardTitle>
                  <CardDescription>
                    Your journey starts at Level 1. Click your current level to
                    see its tasks!
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {levels.map((level) => {
                    const isCompleted = level.level < userLevel;
                    const isCurrent = level.level === userLevel;
                    const isLocked = level.level > userLevel;

                    return (
                      <button
                        key={level.level}
                        onClick={() => handleLevelSelect(level)}
                        className={cn(
                          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 text-center aspect-square transition-all',
                          isCurrent &&
                            'border-primary bg-primary/10 shadow-lg scale-105 cursor-pointer',
                          isLocked && 'border-dashed opacity-50 cursor-not-allowed',
                          isCompleted &&
                            'border-solid border-primary/30 bg-primary/5 opacity-70 cursor-not-allowed'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full font-bold',
                            isCurrent && 'bg-primary text-primary-foreground',
                            isLocked && 'bg-muted text-muted-foreground',
                            isCompleted && 'bg-primary/20 text-primary/80'
                          )}
                        >
                          {isCompleted ? '✓' : level.level}
                        </div>
                        <p className="text-xs font-semibold">{level.name}</p>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <PageHeader
        title="First, a Quick Quiz!"
        description="Let's find out your unique learning style."
      />
      <Card className="w-full max-w-2xl shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <Progress
                value={(currentStep / questions.length) * 100}
                className="mb-4"
              />
              <CardTitle>{questions[currentStep].question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[150px]">
                {questions[currentStep].id === 'language' ? (
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
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
                ) : questions[currentStep].type === 'slider' ? (
                  <RadioGroup
                    onValueChange={(value) =>
                      form.setValue('speakingConfidence', value)
                    }
                    defaultValue={form.watch('speakingConfidence')}
                    className="flex justify-between px-2 pt-4"
                  >
                    {questions[currentStep].options.map((opt) => (
                      <FormItem key={opt.value}>
                        <FormLabel className="flex cursor-pointer flex-col items-center gap-2">
                          <span className="text-3xl">{opt.label}</span>
                          <FormControl>
                            <RadioGroupItem value={opt.value} />
                          </FormControl>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    onValueChange={(value) =>
                      form.setValue(questions[currentStep].id as any, value)
                    }
                    className="grid grid-cols-1 gap-4 md:grid-cols-2"
                  >
                    {questions[currentStep].options.map((opt) => (
                      <FormItem key={opt.value}>
                        <FormLabel className="flex h-full cursor-pointer items-center space-x-3 space-y-0 rounded-md border p-4 transition-all hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary/10">
                          <FormControl>
                            <RadioGroupItem value={opt.value} />
                          </FormControl>
                          <span className="font-normal">{opt.label}</span>
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </CardContent>
            <CardFooter>
              {currentStep < questions.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze My Profile
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
