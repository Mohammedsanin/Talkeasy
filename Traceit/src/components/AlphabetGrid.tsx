"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ALPHABET_DATA } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress as ProgressType } from "@/types";
import { getProgress } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

type AlphabetGridProps = {
  lang: string;
};

export function AlphabetGrid({ lang }: AlphabetGridProps) {
  const langData = ALPHABET_DATA[lang];
  const [progress, setProgress] = useState<ProgressType>({});

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!langData) {
    return <p>Language not found.</p>;
  }

  const langProgress = progress[lang] || {};

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {langData.alphabets.map(({ char }) => {
        const accuracy = langProgress[char] || 0;
        const isMastered = accuracy >= 90;

        return (
          <Link href={`/learn/${lang}/${char}`} key={char}>
            <Card
              className={`aspect-square flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isMastered ? 'bg-accent/30 border-accent' : 'border-primary/20'
              }`}
            >
              <CardContent className="p-2 flex flex-col items-center justify-center relative">
                {isMastered && (
                  <CheckCircle2 className="h-5 w-5 text-accent-foreground absolute top-1 right-1" />
                )}
                <span className="text-4xl md:text-5xl font-bold font-headline text-foreground">
                  {char}
                </span>
                {accuracy > 0 && !isMastered && (
                  <div className="absolute bottom-2 left-2 right-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${accuracy}%` }} />
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
