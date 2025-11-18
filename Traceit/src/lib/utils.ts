import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ALPHABET_DATA } from "@/lib/data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNextAlphabet(lang: string, currentAlphabet: string) {
  const languageAlphabets = ALPHABET_DATA[lang as keyof typeof ALPHABET_DATA]?.alphabets;
  if (!languageAlphabets) return null;

  const currentIndex = languageAlphabets.findIndex(a => a.char === currentAlphabet);
  if (currentIndex === -1 || currentIndex === languageAlphabets.length - 1) {
    return null; // No next alphabet or current not found
  }

  return languageAlphabets[currentIndex + 1];
}
