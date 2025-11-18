"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, RotateCcw, ArrowRightCircle } from "lucide-react";
import { getNextAlphabet } from "@/lib/utils";

type FeedbackDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  accuracy: number;
  aiMessage: string;
  onRetry: () => void;
  lang: string;
  currentAlphabet: string;
};

export function FeedbackDialog({
  isOpen,
  setIsOpen,
  accuracy,
  aiMessage,
  onRetry,
  lang,
  currentAlphabet
}: FeedbackDialogProps) {
    const router = useRouter();

    const handleRetry = () => {
        setIsOpen(false);
        onRetry();
    };

    const nextAlphabet = getNextAlphabet(lang, currentAlphabet);

    const handleNext = () => {
        if (nextAlphabet) {
            setIsOpen(false);
            router.push(`/learn/${lang}/${nextAlphabet.char}`);
        }
    };
    
    let badgeVariant: "default" | "secondary" | "destructive" = "destructive";
    let badgeText = "Needs Improvement";
    if (accuracy >= 85) {
        badgeVariant = "default";
        badgeText = "Excellent!";
    } else if (accuracy >= 60) {
        badgeVariant = "secondary";
        badgeText = "Good Job!";
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
            <ThumbsUp className="h-6 w-6 text-primary" />
            Your Result
          </DialogTitle>
          <DialogDescription>
            Here's how you did. Keep practicing!
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
                <span className="font-medium">Accuracy</span>
                <Badge variant={badgeVariant}>{badgeText}</Badge>
            </div>
            <Progress value={accuracy} className="w-full h-4" />
            <p className="text-right font-bold text-2xl text-primary">{accuracy}%</p>
          
          <div className="mt-4 p-4 bg-accent/20 rounded-lg border border-accent/30">
            <h4 className="font-semibold flex items-center gap-2 mb-2 text-accent-foreground">
                <MessageCircle className="h-5 w-5"/>
                AI Feedback
            </h4>
            <p className="text-sm text-foreground/80">{aiMessage}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          {nextAlphabet ? (
            <Button onClick={handleNext}>
                Next Letter <ArrowRightCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
             <Button onClick={() => router.push(`/learn/${lang}`)}>
                Finish
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
