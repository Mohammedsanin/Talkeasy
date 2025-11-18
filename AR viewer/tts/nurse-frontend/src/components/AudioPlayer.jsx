import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export const AudioPlayer = ({ src, onEnded, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState('');

  // Handle audio source changes
  useEffect(() => {
    if (!src) return;
    
    // Create a new audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event handlers
    const handleCanPlay = () => {
      setIsLoading(false);
      // Auto-play when audio is ready
      audio.play().catch(error => {
        console.warn('Auto-play was prevented:', error);
        // User interaction is needed to play audio in some browsers
      });
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleError = (error) => {
      console.error('Audio error:', error);
      setIsLoading(false);
    };

    // Add event listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnd);
    audio.addEventListener('error', handleError);
    
    // Set the source and preload
    audio.preload = 'auto';
    audio.src = src.startsWith('http') ? src : `${window.location.origin}${src}`;
    
    // Cleanup function
    return () => {
      audio.pause();
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnd);
      audio.removeEventListener('error', handleError);
      audio.src = ''; // Release the audio element
    };
  }, [src, onEnded]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // User interaction is required for audio playback in most browsers
      audioRef.current.play().catch(error => {
        console.warn('Playback failed, trying with user interaction...', error);
      });
    }
  };

  if (isLoading) {
    return (
      <button 
        className={`p-2 rounded-full ${className} animate-pulse`}
        disabled
      >
        <Volume2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button 
      onClick={togglePlayPause}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
      aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
    >
      {isPlaying ? (
        <Pause className="w-4 h-4" />
      ) : (
        <Play className="w-4 h-4" />
      )}
    </button>
  );
};
