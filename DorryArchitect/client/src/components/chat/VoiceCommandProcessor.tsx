import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoiceRecognition } from '@/hooks/use-voice-recognition';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VoiceCommandProcessorProps {
  onCommand: (command: string) => void;
  disabled?: boolean;
  isProcessing?: boolean;
  language?: string;
}

export default function VoiceCommandProcessor({
  onCommand,
  disabled = false,
  isProcessing = false,
  language = 'en-US',
}: VoiceCommandProcessorProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [commandInProgress, setCommandInProgress] = useState<boolean>(false);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    isRecognitionError,
    resetTranscript,
  } = useVoiceRecognition({
    language,
    onTranscriptChange: (text) => {
      setRecognizedText(text);
    },
    onFinalTranscript: (text) => {
      if (text.trim()) {
        handleCommand(text);
      }
    },
  });

  // Process the recognized command
  const handleCommand = useCallback((command: string) => {
    setCommandInProgress(true);
    
    // Process the command
    onCommand(command);
    
    // Reset the transcript after processing
    setTimeout(() => {
      resetTranscript();
      setCommandInProgress(false);
    }, 500);
  }, [onCommand, resetTranscript]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  // Show tooltip on start
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isListening) {
      toast({
        title: t('listeningForCommands'),
        description: t('speakNowToModifyDesign'),
      });
      
      // Auto-stop after 30 seconds if no speech is detected
      timeout = setTimeout(() => {
        if (isListening && !transcript) {
          stopListening();
          toast({
            title: t('listeningTimeout'),
            description: t('noSpeechDetected'),
          });
        }
      }, 30000);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isListening, toast, t, transcript, stopListening]);

  if (!hasRecognitionSupport) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground opacity-50"
              disabled={true}
            >
              <MicOff className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('voiceRecognitionNotSupported')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={isListening ? "text-primary animate-pulse cyberpunk-text" : "text-muted-foreground"}
              onClick={toggleListening}
              disabled={disabled || isProcessing || commandInProgress}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isListening ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">
              {isListening
                ? t('tapToStopListening')
                : t('tapToStartVoiceCommand')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Active listening indicator and transcript */}
      {isListening && (
        <div className="absolute bottom-10 right-0 w-48 bg-background/90 border border-primary/50 rounded-md p-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] backdrop-blur-sm cyberpunk-glow">
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant="outline" className="animate-pulse bg-primary/10 border-primary text-primary font-mono text-xs cyberpunk-text">
              {t('listening')}
            </Badge>
            <div className="flex space-x-1">
              <span className="animate-pulse bg-primary w-1 h-1 rounded-full shadow-[0_0_5px_rgba(0,255,255,0.8)]"></span>
              <span className="animate-pulse bg-primary w-1 h-1 rounded-full shadow-[0_0_5px_rgba(0,255,255,0.8)]" style={{ animationDelay: '0.2s' }}></span>
              <span className="animate-pulse bg-primary w-1 h-1 rounded-full shadow-[0_0_5px_rgba(0,255,255,0.8)]" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
          <div className="text-xs font-mono text-primary/90 max-h-20 overflow-y-auto cyberpunk-text">
            {transcript ? transcript : t('speakNow')}
          </div>
        </div>
      )}
    </div>
  );
}