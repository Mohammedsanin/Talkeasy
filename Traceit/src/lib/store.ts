"use client";

import type { Progress } from "@/types";

const PROGRESS_KEY = "traceit-progress";

export const getProgress = (): Progress => {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const progress = window.localStorage.getItem(PROGRESS_KEY);
    return progress ? JSON.parse(progress) : {};
  } catch (error) {
    console.error("Error reading progress from localStorage", error);
    return {};
  }
};

export const saveProgress = (lang: string, alphabet: string, accuracy: number) => {
  if (typeof window === "undefined") return;
  
  const currentProgress = getProgress();
  const langProgress = currentProgress[lang] || {};
  
  const existingAccuracy = langProgress[alphabet] || 0;
  if (accuracy > existingAccuracy) {
    langProgress[alphabet] = accuracy;
    const updatedProgress = {
      ...currentProgress,
      [lang]: langProgress,
    };
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error("Error saving progress to localStorage", error);
    }
  }
};
