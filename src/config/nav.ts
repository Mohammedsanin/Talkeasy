
import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookText,
  Home,
  Languages,
  MessageCircle,
  Mic,
  PenTool,
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

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Game',
    href: '/lessons',
    icon: Gamepad2,
  },
  {
    title: 'Translate',
    href: '/translate',
    icon: Languages,
  },
  {
    title: 'Pronunciation',
    href: '/pronunciation',
    icon: Mic,
  },
  {
    title: 'Number Pronunciation',
    href: '/number-pronunciation',
    icon: ListOrdered,
  },

  {
    title: 'Grammar Assistant',
    href: '/grammar',
    icon: BookText,
  },
  {
    title: 'AI Chatbot',
    href: '/chatbot',
    icon: MessageCircle,
  },
  {
    title: 'Story Time',
    href: '/story-time',
    icon: BookHeart,
  },
  {
    title: 'Study Plan',
    href: '/study-plan',
    icon: CalendarDays,
  },
  {
    title: 'Document Translator',
    href: '/document-translator',
    icon: FileText,
  },
   {
    title: 'Learn by Exploring',
    href: '/explore',
    icon: Map,
  },
  {
    title: 'Visual Translator',
    href: '/image-to-speech',
    icon: ImageIcon,
  },
  {
    title: 'Video Translator',
    href: '/video-translator',
    icon: Video,
  },
  {
    title: 'Scenario Phrases',
    href: '/scenario-phrases',
    icon: ClipboardList,
  },
  {
    title: 'Alphabet Tracing',
    href: 'http://localhost:9090/',
    icon: PenTool,
    external: true,
  },
  {
    title: 'AR Viewer',
    href: 'http://localhost:5173/',
    icon: View,
    external: true,
  },
];
