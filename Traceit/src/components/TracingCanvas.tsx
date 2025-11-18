"use client";

import { useRef, useEffect, useState } from "react";
import type { Alphabet, Point, Stroke } from "@/types";
import { Button } from "@/components/ui/button";
import { Volume2, RefreshCw, Check, Loader2 } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { useToast } from "@/hooks/use-toast";
import { adjustTracingDifficulty } from "@/ai/flows/adaptive-tracing-difficulty";
import { synthesizeSpeech } from "@/ai/flows/synthesize-speech";
import { saveProgress } from "@/lib/store";

type TracingCanvasProps = {
  lang: string;
  alphabet: Alphabet;
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 300;

export function TracingCanvas({ lang, alphabet }: TracingCanvasProps) {
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userStrokes, setUserStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ accuracy: number; message: string }>({ accuracy: 0, message: "" });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isPronouncing, setIsPronouncing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const { toast } = useToast();

  const drawPath = (ctx: CanvasRenderingContext2D, path: Point[], color: string, width: number) => {
    if (path.length === 0) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };
  
  const drawCharacterGuide = (ctx: CanvasRenderingContext2D, char: string) => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.font = "100 200px 'PT Sans'";
      ctx.fillStyle = "hsl(var(--muted) / 0.05)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  }

  const clearDrawingCanvas = () => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const resetCanvas = () => {
    clearDrawingCanvas();
    setUserStrokes([]);
    setCurrentStroke([]);
  };

  useEffect(() => {
    const canvas = guideCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && alphabet.char) {
      drawCharacterGuide(ctx, alphabet.char);
    }
    resetCanvas();
    // Stop any playing audio when the character changes
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
    }
  }, [alphabet]);
  
  useEffect(() => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
        clearDrawingCanvas();
        userStrokes.forEach(stroke => drawPath(ctx, stroke, 'hsl(var(--primary))', 10));
        if (currentStroke.length > 0) {
            drawPath(ctx, currentStroke, 'hsl(var(--primary))', 10);
        }
    }
  }, [userStrokes, currentStroke]);


  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (clientX === 0 && clientY === 0) return null;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (userStrokes.length === 0 && currentStroke.length === 0) {
        setStartTime(Date.now());
    }
    const point = getCanvasPoint(e);
    if (!point) return;
    setIsDrawing(true);
    setCurrentStroke([point]);
  };

  const handleDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handleEndDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
        setUserStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke([]);
  };

  const calculateAccuracy = (): number => {
    const guideCanvas = guideCanvasRef.current;
    const drawingCanvas = drawingCanvasRef.current;

    if (!guideCanvas || !drawingCanvas || userStrokes.length === 0) return 0;
    
    // We need to redraw the guide on a temporary canvas to get its pixel data without dots
    const tempGuideCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!tempGuideCtx) return 0;
    tempGuideCtx.canvas.width = CANVAS_WIDTH;
    tempGuideCtx.canvas.height = CANVAS_HEIGHT;
    drawCharacterGuide(tempGuideCtx, alphabet.char);

    const drawingCtx = drawingCanvas.getContext('2d', { willReadFrequently: true });
    if(!drawingCtx) return 0;

    const guideImageData = tempGuideCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
    const drawingImageData = drawingCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;

    let matchingPixels = 0;
    let userPixels = 0;
    let guidePixels = 0;

    for (let i = 0; i < guideImageData.length; i += 4) {
      const guidePixelOn = guideImageData[i+3] > 128; // Use a threshold for semi-transparent guide
      const userPixelOn = drawingImageData[i+3] > 0;

      if (guidePixelOn) guidePixels++;
      if (userPixelOn) userPixels++;
      if (guidePixelOn && userPixelOn) matchingPixels++;
    }

    if (guidePixels === 0 || userPixels === 0) return 0;

    const precision = matchingPixels / userPixels;
    const recall = matchingPixels / guidePixels;

    const f1Score = 2 * (precision * recall) / (precision + recall);
    
    return Math.round(isNaN(f1Score) ? 0 : f1Score * 100);
  };
  
  const handleCheck = async () => {
    const endTime = Date.now();
    const durationInSeconds = startTime ? (endTime - startTime) / 1000 : 0;
    
    const totalLength = userStrokes.flat().reduce((acc, point, i, arr) => {
        if (i === 0) return 0;
        const prev = arr[i-1];
        return acc + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2));
    }, 0);

    const speed = durationInSeconds > 0 ? totalLength / durationInSeconds : 0;
    const accuracy = calculateAccuracy();

    try {
        const result = await adjustTracingDifficulty({
            accuracy: accuracy / 100,
            speed: speed,
            currentDifficulty: 5,
        });

        setFeedback({ accuracy, message: result.feedbackMessage });
        saveProgress(lang, alphabet.char, accuracy);

    } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not get AI feedback. Using default message.",
          variant: "destructive"
        })
        setFeedback({ accuracy, message: "Great try! Keep practicing to improve." });
    }
    
    setIsModalOpen(true);
  }

  const handlePronounce = async () => {
    if (isPronouncing) return;
    setIsPronouncing(true);

    try {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play();
        return;
      }
      
      const { audioDataUri } = await synthesizeSpeech({ text: alphabet.char, lang });
      
      const audio = new Audio(audioDataUri);
      audioRef.current = audio;
      audio.play();

      const onEnded = () => {
        setIsPronouncing(false);
        audio.removeEventListener('ended', onEnded);
      };
      audio.addEventListener('ended', onEnded);

    } catch (error) {
      console.error("Error playing pronunciation:", error);
      toast({
        title: "Audio Error",
        description: "Could not play the pronunciation sound.",
        variant: "destructive",
      });
      setIsPronouncing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <div className="flex justify-between items-center w-full">
        <h2 className="text-6xl md:text-8xl font-bold font-headline text-primary">{alphabet.char}</h2>
      </div>

      <div className="relative w-full aspect-[5/3] bg-card rounded-lg shadow-inner border-2 border-primary/10">
        <canvas
          ref={guideCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full"
        />
        <canvas
          ref={drawingCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onMouseDown={handleStartDrawing}
          onMouseMove={handleDrawing}
          onMouseUp={handleEndDrawing}
          onMouseLeave={handleEndDrawing}

          onTouchStart={handleStartDrawing}
          onTouchMove={handleDrawing}
          onTouchEnd={handleEndDrawing}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button variant="outline" size="lg" onClick={handlePronounce} disabled={isPronouncing}>
          {isPronouncing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Volume2 className="mr-2 h-5 w-5" />}
          Pronounce
        </Button>
        <Button variant="outline" size="lg" onClick={resetCanvas}>
          <RefreshCw className="mr-2 h-5 w-5" />
          Clear
        </Button>
        <Button size="lg" onClick={handleCheck} disabled={userStrokes.length === 0}>
          <Check className="mr-2 h-5 w-5" />
          Check
        </Button>
      </div>

      <FeedbackDialog
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        accuracy={feedback.accuracy}
        aiMessage={feedback.message}
        onRetry={resetCanvas}
        lang={lang}
        currentAlphabet={alphabet.char}
      />
    </div>
  );
}
