import React, { useState, useRef, useEffect, useCallback } from 'react';

const VoiceInput = ({ onTranscript, disabled = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }
      const full = (transcript + finalTranscript).trim();
      if (finalTranscript) setTranscript(full);
      // Show interim in real-time
      const display = full + (interimTranscript ? ' ' + interimTranscript : '');
      onTranscript?.(display, false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Send final transcript
      onTranscript?.(transcript, true);
    } else {
      setTranscript('');
      onTranscript?.('', false);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  }, [isListening, transcript, onTranscript]);

  if (!supported) {
    return (
      <div className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
        🎤 Voice input not supported in this browser. Use Chrome or Edge.
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
        isListening
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse'
          : 'bg-surface-hover text-theme-text-secondary hover:bg-primary/10 hover:text-primary border border-theme-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-white' : 'bg-red-500'}`}></span>
      <span>{isListening ? 'Stop Recording' : '🎤 Voice Input'}</span>
    </button>
  );
};

export default VoiceInput;
