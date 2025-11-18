import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

// Audio playback utility
const playAudio = async (audioPath) => {
  try {
    // Use the full URL if the path is relative
    const fullUrl = audioPath.startsWith('http') 
      ? audioPath 
      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${audioPath}`;
    
    const audio = new Audio(fullUrl);
    
    // Handle audio playback errors
    const errorHandler = (error) => {
      console.error('Audio playback error:', error);
      audio.removeEventListener('error', errorHandler);
    };
    
    audio.addEventListener('error', errorHandler);
    
    // Play the audio and return a promise that resolves when playback completes or fails
    return new Promise((resolve, reject) => {
      const handleEnded = () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', errorHandler);
        resolve();
      };
      
      audio.addEventListener('ended', handleEnded);
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', errorHandler);
          reject(error);
        });
      }
    });
  } catch (error) {
    console.error('Error initializing audio playback:', error);
    throw error;
  }
};

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const processAudioInput = async (audioBlob) => {
    const formData = new FormData();
    
    // Convert the blob to the right format if needed
    let processedBlob = audioBlob;
    
    // If the blob is in webm format, we might need to convert it to wav for better compatibility
    if (audioBlob.type.includes('webm')) {
      try {
        // Convert webm to wav using the Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create a new audio buffer with the same data but in WAV format
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
          audioBuffer.numberOfChannels,
          audioBuffer.length,
          audioBuffer.sampleRate
        );
        
        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        
        // Create a script processor to capture the audio data
        const processor = offlineCtx.createScriptProcessor(4096, audioBuffer.numberOfChannels, audioBuffer.numberOfChannels);
        
        // Collect the audio data
        const audioData = [];
        processor.onaudioprocess = (e) => {
          for (let channel = 0; channel < e.inputBuffer.numberOfChannels; channel++) {
            audioData.push(e.inputBuffer.getChannelData(channel).slice());
          }
        };
        
        // Connect the nodes
        source.connect(processor);
        processor.connect(offlineCtx.destination);
        source.start(0);
        
        // Wait for the audio to finish processing
        await new Promise(resolve => {
          source.onended = resolve;
        });
        
        // Convert the audio data to a WAV file
        const wavBlob = await audioBufferToWav(audioBuffer);
        processedBlob = new Blob([wavBlob], { type: 'audio/wav' });
      } catch (error) {
        console.warn('Failed to convert audio format, using original:', error);
        // Fall back to the original blob if conversion fails
      }
    }
    
    formData.append('audio', processedBlob, `recording-${Date.now()}.${processedBlob.type.includes('wav') ? 'wav' : 'webm'}`);
    
    try {
      const sttResponse = await fetch(`${backendUrl}/api/speech/stt`, {
        method: 'POST',
        body: formData,
      });
      
      if (!sttResponse.ok) {
        const errorData = await sttResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to transcribe audio');
      }
      
      const { text } = await sttResponse.json();
      if (!text) {
        throw new Error('No speech was detected in the recording');
      }
      return text;
    } catch (error) {
      console.error('Error processing audio input:', error);
      setError(error.message || 'Failed to process audio');
      throw error;
    }
  };
  
  // Helper function to convert audio buffer to WAV format
  const audioBufferToWav = (buffer) => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 3; // 32-bit float
    const bitDepth = 32;
    
    let result = new ArrayBuffer(44 + buffer.length * numChannels * (bitDepth / 8));
    let view = new DataView(result);
    
    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + buffer.length * numChannels * (bitDepth / 8), true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (raw)
    view.setUint16(20, format, true);
    // Channel count
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    // Bits per sample
    view.setUint16(34, bitDepth, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, buffer.length * numChannels * (bitDepth / 8), true);
    
    // Write the PCM samples
    const writeAudioData = () => {
      const offset = 44;
      const length = buffer.length;
      const channels = [];
      
      // Get all channels
      for (let channel = 0; channel < numChannels; channel++) {
        channels.push(buffer.getChannelData(channel));
      }
      
      // Interleave the channels
      if (bitDepth === 32) {
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            view.setFloat32(offset + (i * numChannels + channel) * 4, sample, true);
          }
        }
      } else if (bitDepth === 16) {
        for (let i = 0; i < length; i++) {
          for (let channel = 0; channel < numChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            view.setInt16(offset + (i * numChannels + channel) * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          }
        }
      }
    };
    
    writeAudioData();
    return new Uint8Array(result);
  };
  
  // Helper function to write strings to the data view
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const playAudioResponse = useCallback(async (audioUrl) => {
    if (!audioUrl) return Promise.resolve();
    
    try {
      await playAudio(audioUrl);
    } catch (error) {
      console.error('Error playing audio response:', error);
      // Continue even if audio fails
    }
  }, []);

  const chat = useCallback(async (input, isAudio = false) => {
    if (loading) return;

    // Helper: only allow local language learning related questions
    const isAllowedQuestion = (text) => {
      if (!text) return false;
      const allowKeywords = [
        'language', 'local language', 'translate', 'translation', 'grammar', 'vocabulary', 'vocab',
        'pronunciation', 'phonetic', 'learn', 'learning', 'lesson', 'phrase', 'sentence', 'conversation',
        'speaking', 'listening', 'reading', 'writing', 'dialect', 'translate to', 'how to say'
      ];
      const t = text.toLowerCase();
      return allowKeywords.some(k => t.includes(k));
    };

    // If input is raw text, validate before starting loading state
    if (!isAudio && !isAllowedQuestion(String(input || ''))) {
      const noticeText = 'I only answer questions about local language learning (vocabulary, grammar, pronunciation, translation, and learning tips). Please ask a related question.';
      const notice = { text: noticeText, isUser: false, timestamp: new Date().toISOString() };
      setMessage(notice);
      setMessages(prev => [...prev, notice]);
      return notice;
    }

    setLoading(true);
    setError(null);
    
    try {
      let text = input;
      
      // Process audio if input is an audio blob
      if (isAudio) {
        text = await processAudioInput(input);
        if (!text) return;

        // Validate transcribed audio text
        if (!isAllowedQuestion(String(text || ''))) {
          const noticeText = 'I only answer questions about local language learning (vocabulary, grammar, pronunciation, translation, and learning tips). Please ask a related question.';
          const notice = { text: noticeText, isUser: false, timestamp: new Date().toISOString() };
          setMessage(notice);
          setMessages(prev => [...prev, notice]);
          setLoading(false);
          return notice;
        }
      }

      // Add user message to chat
      const userMessage = { text, isUser: true, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({ 
          message: text,
          conversationHistory: messages
            .filter(m => m.text)
            .map(m => ({
              role: m.isUser ? 'user' : 'assistant',
              parts: [{ text: m.text }]
            }))
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || 'Failed to get response from server');
      }
      
      const data = await response.json();
      
      if (!data || (!data.response && !data.audioUrl)) {
        throw new Error('Invalid response format from server');
      }
      
      // Clean the response text to remove special characters that might be read literally
      const cleanText = (text) => {
        if (!text) return '';
        // Remove markdown formatting, asterisks, and other special characters
        return text
          .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
          .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
          .replace(/`(.*?)`/g, '$1')         // Remove `code`
          .replace(/[\*_~`#\[\](){}<>]/g, '') // Remove other markdown characters
          .replace(/\s+/g, ' ')              // Replace multiple spaces with a single space
          .trim();
      };
      
      const responseText = cleanText(data.response || data.text || 'No response text');
      const audioUrl = data.audioUrl;
      
      // Create AI message with both text and audio
      const aiMessage = {
        text: responseText,
        audioUrl: audioUrl,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Update state with the AI's response
      setMessages(prev => [...prev, aiMessage]);
      setMessage(aiMessage);
      
      // Keep the camera zoomed in during the conversation
      setCameraZoomed(true);
      
      // Play the audio response if available
      if (audioUrl) {
        try {
          // Play audio without affecting camera zoom
          await playAudio(audioUrl);
        } catch (audioError) {
          console.error('Error playing audio response:', audioError);
          // Continue even if audio playback fails
        }
      }
      
      return aiMessage;
    } catch (error) {
      console.error('Error in chat:', error);
      setError(error.message || 'Failed to process your request');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loading, playAudio]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume audio context in case it was suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          await chat(audioBlob, true);
        } catch (error) {
          console.error('Error processing recording:', error);
        } finally {
          // Clean up the stream
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError('Recording error: ' + (event.error?.message || 'Unknown error'));
        stopRecording();
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setCameraZoomed(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 30000);
      
    } catch (err) {
      console.error("Error starting recording:", err);
      setError('Microphone access denied or not available');
      setIsRecording(false);
      throw err;
    }
  }, [chat]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }
  }, []);

  const onMessagePlayed = useCallback(() => {
    // Only clear the current message, keep the camera zoomed
    setMessage(null);
    // Don't reset camera zoom here to keep the 3D model visible
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chat,
        messages,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        isRecording,
        startRecording,
        stopRecording,
        error
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};