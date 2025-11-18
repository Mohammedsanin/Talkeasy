
'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Mic,
  BookText,
  MessageCircle,
  Award,
  Languages,
  PenTool,
  ArrowRight,
  CalendarDays,
  FileText,
  View,
  Map,
  Image as ImageIcon,
  Video,
  ClipboardList,
  Gamepad2,
  BookHeart,
  ListOrdered,
} from 'lucide-react';
import PageHeader from '@/components/page-header';

const features = [
  {
    title: 'Personalized Game',
    description: 'Play fun, interactive games tailored to your learning style.',
    href: '/lessons',
    icon: <Gamepad2 className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Translator',
    description: 'Translate text between different languages.',
    href: '/translate',
    icon: <Languages className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Pronunciation Feedback',
    description: 'Get real-time feedback on your spoken language skills.',
    href: '/pronunciation',
    icon: <Mic className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Number Pronunciation',
    description: 'Learn how to say numbers in different languages.',
    href: '/number-pronunciation',
    icon: <ListOrdered className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Grammar Assistant',
    description: 'Improve your writing with instant grammar corrections.',
    href: '/grammar',
    icon: <BookText className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AI Chatbot',
    description: 'Practice conversations in simulated real-life scenarios.',
    href: '/chatbot',
    icon: <MessageCircle className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Story Time',
    description: 'Learn language and culture through engaging folktales.',
    href: '/story-time',
    icon: <BookHeart className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Study Plan',
    description: 'Get a personalized AI-generated study plan for your goals.',
    href: '/study-plan',
    icon: <CalendarDays className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Document Translator',
    description: 'Summarize and translate text from documents.',
    href: '/document-translator',
    icon: <FileText className="h-8 w-8 text-primary" />,
  },
   {
    title: 'Learn by Exploring',
    description: 'Explore a map and learn language in a real-world context.',
    href: '/explore',
    icon: <Map className="h-8 w-8 text-primary" />,
  },
   {
    title: 'Visual Translator',
    description: 'Upload an image to identify objects and hear their names.',
    href: '/image-to-speech',
    icon: <ImageIcon className="h-8 w-8 text-primary" />,
  },
   {
    title: 'Video Context Translator',
    description: 'Get conversational help for real-world situations from a video.',
    href: '/video-translator',
    icon: <Video className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Scenario Phrases',
    description: 'Learn key phrases for common real-world situations.',
    href: '/scenario-phrases',
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Alphabet Tracing',
    href: 'http://localhost:9090/',
    description: 'Learn new alphabets by tracing characters with your mouse.',
    icon: <PenTool className="h-8 w-8 text-primary" />,
  },
  {
    title: 'AR Viewer',
    href: 'http://localhost:5173/',
    description: 'View augmented reality models and scenes.',
    icon: <View className="h-8 w-8 text-primary" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Welcome to Talkeasy"
        description="Your personal AI-powered language learning companion. Select a tool to get started."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const isExternal = feature.href.startsWith('http');
          const linkContent = (
             <Card className="flex h-full flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-primary">
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  {feature.icon}
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <CardTitle className="font-headline text-xl">
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          );

          if (isExternal) {
            return (
              <a href={feature.href} key={feature.href} className="group" target="_blank" rel="noopener noreferrer">
                {linkContent}
              </a>
            )
          }

          return (
            <Link href={feature.href} key={feature.href} className="group">
             {linkContent}
            </Link>
          )
        })}
      </div>
    </div>
  );
}
