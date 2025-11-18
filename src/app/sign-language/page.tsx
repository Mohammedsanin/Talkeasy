'use client';

import { useState, useRef, useEffect } from 'react';
import { PenTool, Sparkles, Loader2, RefreshCw } from 'lucide-react';
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
import { getAlphabetTracingFeedbackAction } from '@/app/actions';
import type { AlphabetLearningOutput } from '@/ai/flows/alphabets-tracing-and-studying';

const languages = {
  hindi: ['अ', 'आ', 'इ', 'ई', 'उ'],
  bengali: ['অ', 'আ', 'ই', 'ঈ', 'উ'],
  tamil: ['அ', 'ஆ', 'இ', 'ஈ', 'உ'],
  gujarati: ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ'],
  telugu: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ'],
  marathi: ['अ', 'आ', 'इ', 'ई', 'उ'],
  kannada: ['ಅ', 'ಆ', 'ಇ', 'ಈ', 'ಉ'],
  malayalam: ['അ', 'ആ', 'ഇ', 'ഈ', 'ഉ'],
  punjabi: ['ਅ', 'ਆ', 'ਇ', 'ਈ', 'ਉ'],
};

export default function SignLanguagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [selectedChar, setSelectedChar] = useState(languages.hindi[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AlphabetLearningOutput | null>(null);
  const { toast } = useToast();

  const getCanvasContext = () => canvasRef.current?.getContext('2d');

  const clearCanvas = () => {
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setFeedback(null);
  };
  
  useEffect(() => {
    clearCanvas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChar]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { offsetX, offsetY } = event.nativeEvent;
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = '#3F51B5';
    ctx.lineWidth = 10;
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

    const dataUrl = canvas.toDataURL('image/png');
    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await getAlphabetTracingFeedbackAction({
        language: selectedLang,
        alphabetCharacter: selectedChar,
        tracingDataUri: dataUrl,
      });
      setFeedback(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Failed to get tracing feedback. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    setSelectedChar(languages[lang as keyof typeof languages][0]);
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Indian Alphabet Tracing"
        description="Learn Indian language alphabets by tracing the signs. Get instant AI feedback."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tracing Pad</CardTitle>
            <div className="flex items-center justify-between">
                <CardDescription>
                  Trace the sign for the selected letter.
                </CardDescription>
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
              <span className="text-9xl font-bold text-muted-foreground/20 pointer-events-none">
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
              Our AI coach will provide feedback on your tracing.
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
                <div>
                  <h3 className="font-semibold">Feedback</h3>
                  <p className="text-sm">{feedback.feedback}</p>
                </div>
                 <div>
                  <h3 className="font-semibold">Example Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {feedback.exampleWords.map((word, i) => (
                      <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary-foreground">{word}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Related Characters</h3>
                   <div className="flex flex-wrap gap-2">
                    {feedback.relatedCharacters.map((char, i) => (
                      <span key={i} className="rounded-md border bg-muted px-3 py-1 text-lg font-bold">{char}</span>
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
