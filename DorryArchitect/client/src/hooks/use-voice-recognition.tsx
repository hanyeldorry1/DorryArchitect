import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';

// Define types for the Speech Recognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

type UseVoiceRecognitionProps = {
  language?: string;
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  continuous?: boolean;
};

type UseVoiceRecognitionReturn = {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  isRecognitionError: boolean;
  resetTranscript: () => void;
};

export function useVoiceRecognition({
  language = 'en-US',
  onTranscriptChange,
  onFinalTranscript,
  continuous = false,
}: UseVoiceRecognitionProps = {}): UseVoiceRecognitionReturn {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);
  const [isRecognitionError, setIsRecognitionError] = useState<boolean>(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setHasRecognitionSupport(true);
      const recognition = new SpeechRecognition() as SpeechRecognition;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      setRecognition(recognition);
    } else {
      setHasRecognitionSupport(false);
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [language, continuous]);

  // Handle recognition results
  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript = event.results[i][0].transcript;
        isFinal = event.results[i].isFinal;
      }

      setTranscript(currentTranscript);
      onTranscriptChange?.(currentTranscript);

      if (isFinal) {
        onFinalTranscript?.(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      setIsRecognitionError(true);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: t('microphoneAccessDenied'),
          description: t('microphoneAccessDeniedDesc'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('speechRecognitionError'),
          description: t('speechRecognitionErrorDesc'),
          variant: "destructive",
        });
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [recognition, onTranscriptChange, onFinalTranscript, toast, t]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognition) return;

    setIsRecognitionError(false);
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Speech recognition start error:', error);
      toast({
        title: t('speechRecognitionError'),
        description: t('speechRecognitionErrorDesc'),
        variant: "destructive",
      });
    }
  }, [recognition, toast, t]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognition) return;

    try {
      recognition.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Speech recognition stop error:', error);
    }
  }, [recognition]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    isRecognitionError,
    resetTranscript,
  };
}

// Add these interfaces to the global Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}