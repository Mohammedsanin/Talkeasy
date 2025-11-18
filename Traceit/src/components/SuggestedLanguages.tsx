"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Languages, AlertTriangle } from "lucide-react";

export function SuggestedLanguages() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/suggest-languages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Simulate installed apps to get suggestions
          body: JSON.stringify({ installedApps: ["Duolingo", "Babbel"] }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const result = await response.json();
        setSuggestions(result.suggestedLanguages);
      } catch (error) {
        console.error("Failed to get language suggestions:", error);
        setError("Could not load suggestions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getSuggestions();
  }, []);

  return (
    <Card className="h-full shadow-lg border-2 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl text-accent-foreground">
          <Lightbulb className="h-6 w-6 text-accent" />
          Personalized Suggestions
        </CardTitle>
        <CardDescription>AI-powered recommendations just for you!</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        ) : error ? (
            <div className="flex flex-col items-center justify-center text-center text-destructive p-4 bg-destructive/10 rounded-md">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p className="font-semibold">{error}</p>
            </div>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((lang, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-full">
                  <Languages className="h-5 w-5 text-accent" />
                </div>
                <span className="font-medium text-foreground/90">{lang}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
