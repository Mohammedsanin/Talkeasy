import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { Mic, StopCircle, Send, Loader2 } from 'lucide-react';
import { AudioPlayer } from "./AudioPlayer";

export const UI = () => {
  const [input, setInput] = useState("");
  const inputRef = useRef();
  const { 
    chat, 
    loading, 
    message, 
    onMessagePlayed,
    isRecording,
    startRecording,
    stopRecording,
    error
  } = useChat();

  // Remove the onInteraction effect since it's not needed
  // and was causing errors when not provided

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userInput = input;
    setInput(""); // Clear input immediately for better UX
    try {
      await chat(userInput);
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      try {
        await startRecording();
      } catch (err) {
        console.error('Recording error:', err);
      }
    }
  };


  return (
    // make this container relative so we can absolutely position the message box
    <div className="relative h-full w-full p-4">
      <div className="w-full max-w-4xl mx-auto space-y-4 px-4">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {message && (
          // fixed message box: center-bottom on small screens, bottom-right on md+ (desktop)
          <div className="fixed left-1/2 bottom-6 -translate-x-1/2 md:right-6 md:left-auto md:translate-x-0 md:bottom-12 bg-white/75 backdrop-blur-sm rounded-xl p-4 shadow-lg max-w-md w-full animate-fade-in overflow-hidden z-50">
            <div className="flex justify-between items-start gap-2">
              <p className="text-gray-800 break-words max-w-[28rem]">{message.text}</p>
              <div className="flex items-center gap-2">
                {message.audioUrl && (
                  <AudioPlayer 
                    src={message.audioUrl} 
                    onEnded={onMessagePlayed}
                    className="text-blue-500 hover:text-blue-600"
                  />
                )}
                <button
                  onClick={onMessagePlayed}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                  aria-label="Dismiss message"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSubmit}
          // position the input near the message panel on the lower-right for wide screens,
          // but center it at the bottom on small screens
          className={`absolute right-16 bottom-4 flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-xl pointer-events-auto transition-all duration-300 w-full max-w-md z-50 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:bottom-6 ${
            isRecording ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Ask me anything..."}
            className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800 rounded-xl text-base"
            disabled={loading || isRecording}
          />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={loading}
              className={`p-2.5 rounded-xl transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              {isRecording ? (
                <StopCircle size={22} />
              ) : (
                <Mic size={22} />
              )}
            </button>
            
            <button
              type="submit"
              disabled={loading || !input.trim() || isRecording}
              className={`p-2.5 rounded-xl transition-colors ${
                loading || !input.trim() || isRecording
                  ? 'bg-gray-200 text-gray-400'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title="Send Message"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <Send size={22} />
              )}
            </button>
          </div>
  </form>
      </div>
    </div>
  );
};