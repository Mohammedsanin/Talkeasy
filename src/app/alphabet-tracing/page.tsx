'use client';

import { useState, useRef, useEffect } from 'react';
import { PenTool, Sparkles, Loader2, RefreshCw, Volume2 } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAlphabetTracingFeedbackAction, adjustTracingDifficultyAction, synthesizeSpeechAction } from '@/app/actions';
import type { AlphabetLearningOutput } from '@/ai/flows/alphabets-tracing-and-studying';
import type { AdjustTracingDifficultyOutput } from '@/ai/flows/adaptive-tracing-difficulty';
import { Progress } from '@/components/ui/progress';

const languages = {
  hindi: ['अ', 'आ', 'इ', 'ई', 'उ'],
  bengali: ['অ', 'আ', 'ই', 'ঈ', 'উ'],
  tamil: ['அ', 'ஆ', 'இ', 'ஈ', 'உ'],
  telugu: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ'],
  marathi: ['अ', 'आ', 'इ', 'ई', 'उ'],
  kannada: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ'],
  malayalam: ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ'],
  punjabi: ['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ'],
};

export default function AlphabetTracingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [selectedChar, setSelectedChar] = useState(languages.hindi[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AlphabetLearningOutput | null>(null);
  const [difficultyFeedback, setDifficultyFeedback] = useState<AdjustTracingDifficultyOutput | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(5);
  const [drawingStartTime, setDrawingStartTime] = useState<number | null>(null);
  const [pixelsDrawn, setPixelsDrawn] = useState(0);

  const { toast } = useToast();

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setFeedback(null);
    setDifficultyFeedback(null);
    setPixelsDrawn(0);
  };

  useEffect(() => {
    clearCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChar]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    setIsDrawing(true);
    setDrawingStartTime(Date.now());
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { offsetX, offsetY } = event.nativeEvent;
    
    // Simple distance calculation to count "pixels"
    const lastPoint = ctx.getImageData(offsetX, offsetY, 1, 1); // Not perfect but gives a sense of movement
    setPixelsDrawn(p => p + 1);

    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = '#3F51B5';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawingEndTime = Date.now();
    const drawingDuration = drawingStartTime ? (drawingEndTime - drawingStartTime) / 1000 : 0; // in seconds
    const speed = drawingDuration > 0 ? pixelsDrawn / drawingDuration : 0; // pixels per second

    const dataUrl = canvas.toDataURL('image/png');
    setIsLoading(true);
    setFeedback(null);
    setDifficultyFeedback(null);

    try {
      // 1. Get initial feedback
      const traceResult = await getAlphabetTracingFeedbackAction({
        language: selectedLang,
        alphabetCharacter: selectedChar,
        tracingDataUri: dataUrl,
      });
      setFeedback(traceResult);

      // Assuming we get a numeric score from the feedback for accuracy, let's fake it for now
      // A real implementation would parse this from `traceResult.feedback` or have it in the schema
      const accuracy = Math.random() * (0.9 - 0.4) + 0.4; // Random accuracy between 0.4 and 0.9

      // 2. Adjust difficulty
      const difficultyResult = await adjustTracingDifficultyAction({
          accuracy,
          speed,
          currentDifficulty,
          languageProficiency: 'beginner'
      });

      setDifficultyFeedback(difficultyResult);
      setCurrentDifficulty(difficultyResult.newDifficulty);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get tracing feedback. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setDrawingStartTime(null);
      setPixelsDrawn(0);
    }
  };
  
  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    setSelectedChar(languages[lang as keyof typeof languages][0]);
  }
  
  const playAudio = async (text: string) => {
    try {
      const { audioDataUri } = await synthesizeSpeechAction({ text, lang: selectedLang.substring(0, 2) });
      const audio = new Audio(audioDataUri);
      audio.play();
    } catch (error) {
      console.error("Speech synthesis failed", error);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: 'Could not play audio.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Alphabet Tracing"
        description="Learn new alphabets by tracing characters. Get AI feedback on your writing."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Tracing Pad</CardTitle>
                <CardDescription>
                  Select a language and character, then trace it on the pad below.
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">Difficulty</div>
                <div className="text-lg font-bold text-primary">{currentDifficulty}/10</div>
                <Progress value={currentDifficulty * 10} className="w-24 h-2 mt-1" />
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Select value={selectedLang} onValueChange={handleLangChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(languages).map((lang) => (
                    <SelectItem key={lang} value={lang} className="capitalize">{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedChar} onValueChange={setSelectedChar}>
                <SelectTrigger>
                  <SelectValue placeholder="Character" />
                </SelectTrigger>
                <SelectContent>
                  {languages[selectedLang as keyof typeof languages].map((char) => (
                    <SelectItem key={char} value={char}>{char}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-9xl font-bold text-muted-foreground/20 pointer-events-none"
                style={{ opacity: 1 - (currentDifficulty / 15) }}
              >
                {selectedChar}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              width="500"
              height="300"
              className="w-full cursor-crosshair rounded-lg border-2 border-dashed bg-transparent"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="mt-4 flex gap-4">
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Feedback
              </Button>
              <Button variant="outline" onClick={clearCanvas}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
            <CardDescription>
              Our AI coach will provide feedback and examples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p>Analyzing your tracing...</p>
              </div>
            ) : feedback ? (
              <div className="space-y-4">
                 {difficultyFeedback && (
                    <div className="rounded-lg bg-accent/50 p-3 text-center text-sm font-medium text-accent-foreground">
                        {difficultyFeedback.feedbackMessage}
                    </div>
                 )}
                <div>
                  <h3 className="font-semibold">Feedback</h3>
                  <p className="text-sm">{feedback.feedback}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Example Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.exampleWords.map((word, i) => (
                      <button key={i} onClick={() => playAudio(word)} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary-foreground transition-colors hover:bg-primary/20">
                          {word} <Volume2 className="h-4 w-4"/>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Related Characters</h3>
                   <div className="flex flex-wrap gap-2">
                    {feedback.relatedCharacters.map((char, i) => (
                      <button key={i} onClick={() => playAudio(char)} className="flex items-center gap-1 rounded-md border bg-muted px-3 py-1 text-lg font-bold transition-colors hover:bg-muted/80">
                          {char} <Volume2 className="h-4 w-4"/>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center text-muted-foreground">
                <PenTool className="mx-auto mb-4 h-12 w-12" />
                <p>Your feedback will appear here after you submit your tracing.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
