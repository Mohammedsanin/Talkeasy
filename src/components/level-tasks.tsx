
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getPronunciationFeedbackAction } from '@/app/actions';
import { Loader2, Mic, MicOff, Volume2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface TaskProps {
  task: {
    id: string;
    xp: number;
    content: any;
  };
  onComplete: (taskId: string) => void;
  language: string;
}

export const ListeningTask = ({ task, onComplete, language }: TaskProps) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const audioDataUri = task.content.audioDataUri;

  const handlePlaySound = () => {
    if (audioDataUri) {
        const audio = new Audio(audioDataUri);
        audio.play();
        return;
    }
    
    // Fallback to browser TTS if AI audio fails or for English
    if (!window.speechSynthesis) {
      toast({
        variant: 'destructive',
        title: 'TTS Not Supported',
        description: 'Your browser does not support text-to-speech.',
      });
      return;
    }
    const textToSpeak = task.content.textToSpeak;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = () => {
    if (selectedValue === task.content.answer) {
      toast({ title: 'Correct!', description: `You earned ${task.xp} XP.` });
      onComplete(task.id);
    } else {
      toast({ variant: 'destructive', title: 'Not quite!', description: 'Try again.' });
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={handlePlaySound} disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 animate-spin"/> : <Volume2 className="mr-2" />} 
        Play Sound
      </Button>
      <p>{task.content.question}</p>
      <RadioGroup onValueChange={setSelectedValue}>
        {task.content.options.map((option: string, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${task.id}-${index}`} />
            <Label htmlFor={`${task.id}-${index}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleSubmit} disabled={!selectedValue}>
        Submit
      </Button>
    </div>
  );
};

export const SpeakingTask = ({ task, onComplete, language }: TaskProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    setAudioDataUri(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            setAudioDataUri(reader.result as string);
          };
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description:
            'Could not access the microphone. Please check your browser permissions.',
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    if (!audioDataUri) return;

    setIsLoading(true);
    setScore(null);
    try {
      const result = await getPronunciationFeedbackAction({
        userAudio: audioDataUri,
        targetText: task.content.phrase,
        language: language,
      });
      
      const newScore = result.score ?? 0;
      setScore(newScore);

      // As long as the AI could understand something, let the user pass.
      if (result.spokenText) {
        toast({
          title: 'Good practice!',
          description: `You earned ${task.xp} XP. Your score was ${newScore}.`,
        });
        setTimeout(() => onComplete(task.id), 1500);
      } else {
        toast({
          variant: 'destructive',
          title: 'Try again!',
          description: "The AI couldn't quite understand you. Please try recording again.",
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error checking pronunciation.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p>Try to say:</p>
      <p className="text-2xl font-bold text-primary">
        "{task.content.phrase}"
      </p>
      <Button
        variant={isRecording ? 'destructive' : 'outline'}
        onClick={handleToggleRecording}
      >
        {isRecording ? (
          <MicOff className="mr-2" />
        ) : (
          <Mic className="mr-2" />
        )}
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
      {audioDataUri && !isRecording && (
        <audio controls src={audioDataUri} className="w-full" />
      )}
      {isLoading && <Loader2 className="mx-auto h-8 w-8 animate-spin" />}
      {score !== null && (
        <div className="mt-4">
          <p className="text-sm font-medium text-center">
            Your Score: {score}/100
          </p>
          <Progress value={score} className="h-2 mt-1" />
        </div>
      )}
      <Button onClick={handleSubmit} disabled={!audioDataUri || isLoading}>
        Submit Recording
      </Button>
    </div>
  );
};

export const ReadingTask = ({ task, onComplete }: TaskProps) => {
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (selectedValue === task.content.answer) {
            toast({ title: 'Correct!', description: `You earned ${task.xp} XP.` });
            onComplete(task.id);
        } else {
            toast({ variant: 'destructive', title: 'Not quite!', description: 'Try again.' });
        }
    };

    return (
        <div className="space-y-4">
            <p className="italic bg-muted p-4 rounded-md">Read the following: "{task.content.text}"</p>
            <p>{task.content.question}</p>
            <RadioGroup onValueChange={setSelectedValue}>
                {task.content.options.map((option: string) => (
                    <div key={option} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${task.id}-${option}`} />
                        <Label htmlFor={`${task.id}-${option}`}>{option}</Label>
                    </div>
                ))}
            </RadioGroup>
            <Button onClick={handleSubmit} disabled={!selectedValue}>Submit Answer</Button>
        </div>
    );
};

export const WritingTask = ({ task, onComplete }: TaskProps) => {
    const [text, setText] = useState('');
    const { toast } = useToast();

    const handleSubmit = () => {
        // Simple validation for now
        if (text.length > 2) {
            toast({ title: 'Good job!', description: `You earned ${task.xp} XP.` });
            onComplete(task.id);
        } else {
            toast({ variant: 'destructive', title: 'Too short!', description: 'Please write a bit more.' });
        }
    };
    return (
        <div className="space-y-4">
            <p>{task.content.prompt}</p>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
            <Button onClick={handleSubmit} disabled={!text}>Submit Text</Button>
        </div>
    );
};
