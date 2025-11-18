export type Point = {
  x: number;
  y: number;
};

export type Stroke = Point[];

export type Alphabet = {
  char: string;
  pronunciationUrl?: string; // URL to the audio file
  // strokes are no longer needed as we draw the character directly
};

export type LanguageData = {
  name: string;
  iconId: string;
  alphabets: Alphabet[];
};

export type Progress = {
  [lang: string]: {
    [alphabet: string]: number; // Store best accuracy
  };
};

export type LanguageProficiency = "beginner" | "intermediate" | "advanced";
