import { useState, useRef, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { ChatMessage } from '@shared/schema';
import { sendChatMessage, getTTSStatus } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  VolumeX, 
  Volume2, 
  Trash2, 
  Send, 
  Loader,
  Mic,
  MicOff
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import VoiceCommandProcessor from './VoiceCommandProcessor';

interface ChatInterfaceProps {
  projectId: number;
  messages: ChatMessage[];
  isLoading: boolean;
  onMessageSent: () => void;
}

export default function ChatInterface({ projectId, messages, isLoading, onMessageSent }: ChatInterfaceProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Check if TTS is available
  useEffect(() => {
    const checkTTSStatus = async () => {
      try {
        const status = await getTTSStatus();
        setTtsAvailable(status.available);
      } catch (error) {
        console.error('Error checking TTS status:', error);
        setTtsAvailable(false);
      }
    };
    
    checkTTSStatus();
  }, []);

  // Create audio player
  useEffect(() => {
    setAudioPlayer(new Audio());
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const response = await sendChatMessage(projectId, message, ttsEnabled);
      setMessage('');
      onMessageSent();
      
      // Play audio if TTS is enabled and audio URL is provided
      if (ttsEnabled && response.speechUrl && audioPlayer) {
        audioPlayer.src = response.speechUrl;
        audioPlayer.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    } catch (error) {
      toast({
        title: t('messageSendingFailed'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleKeyPress
      handleSendMessage();
    }
  };

  // Toggle TTS
  const toggleTTS = () => {
    if (!ttsAvailable && !ttsEnabled) {
      toast({
        title: t('ttsNotAvailable'),
        description: t('ttsNotAvailableDesc'),
        variant: "destructive"
      });
      return;
    }
    setTtsEnabled(!ttsEnabled);
  };

  // Clear chat
  const clearChat = () => {
    toast({
      title: t('chatCleared'),
      description: t('chatClearedDesc')
    });
    // Note: In a real implementation, this would call an API to clear the chat history
  };

  // Format timestamp
  const formatTime = (timestamp: Date | null) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'h:mm a');
  };
  
  // Handle voice command
  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;
    
    setMessage(command);
    setIsVoiceProcessing(true);
    
    try {
      const response = await sendChatMessage(projectId, command, ttsEnabled);
      onMessageSent();
      
      // Play audio if TTS is enabled and audio URL is provided
      if (ttsEnabled && response.speechUrl && audioPlayer) {
        audioPlayer.src = response.speechUrl;
        audioPlayer.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      
      toast({
        title: t('voiceCommandProcessed'),
        description: t('designBeingUpdated'),
      });
    } catch (error) {
      toast({
        title: t('voiceCommandFailed'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: "destructive"
      });
    } finally {
      setMessage('');
      setIsVoiceProcessing(false);
    }
  };

  return (
    <section className="bg-card rounded-lg overflow-hidden border border-primary/50 shadow-[0_0_20px_rgba(0,255,255,0.2)] relative after:absolute after:inset-0 after:bg-gradient-to-br after:from-primary/5 after:via-transparent after:to-accent/5 after:pointer-events-none">
      <div className="p-4 border-b border-primary/50 flex justify-between items-center bg-background/90">
        <h3 className="text-lg font-semibold font-mono tracking-wider text-primary cyberpunk-text">{t('designAssistant')}</h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTTS}
            title={ttsEnabled ? t('disableVoiceOutput') : t('enableVoiceOutput')}
            disabled={!ttsAvailable && !ttsEnabled}
            className={!ttsAvailable && !ttsEnabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/20'}
          >
            {ttsEnabled ? (
              <Volume2 className="h-5 w-5 text-primary cyberpunk-text" />
            ) : (
              <VolumeX className="h-5 w-5 text-accent/70" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            title={t('clearChat')}
            className="hover:bg-destructive/20"
          >
            <Trash2 className="h-5 w-5 text-accent/70 hover:text-destructive" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto p-4 bg-gradient-to-b from-background/100 to-background/70" ref={chatMessagesRef}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="h-8 w-8 animate-spin text-primary cyberpunk-text" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-primary/60 font-mono tracking-wide cyberpunk-text">{t('noChatHistory')}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : ''}`}
            >
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-md bg-primary/80 flex items-center justify-center text-background flex-shrink-0 mr-2 border border-primary cyberpunk-glow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              
              <div 
                className={`${
                  message.sender === 'user' 
                    ? 'bg-accent/10 border border-accent/40 text-foreground backdrop-blur-sm shadow-[0_0_10px_rgba(255,0,255,0.15)]' 
                    : 'bg-background/80 border border-primary/40 text-foreground backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,255,0.15)]'
                } rounded-md p-3 max-w-[75%]`}
              >
                <p className={`text-sm ${message.sender === 'assistant' ? 'font-mono tracking-wide cyberpunk-text' : 'cyberpunk-accent'}`}>
                  {message.content}
                </p>
                <div className={`mt-2 flex ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  {message.sender === 'assistant' && 
                   (message.designChanges ? (
                    <div className="flex space-x-2 mr-auto">
                      <Button variant="outline" size="sm" className="h-6 text-xs bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 cyberpunk-glow">
                        {t('viewUpdatedDesign')}
                      </Button>
                      <Button variant="outline" size="sm" className="h-6 text-xs bg-background/80 border-accent/30 text-accent/90 hover:bg-accent/10">
                        {t('undoChanges')}
                      </Button>
                    </div>
                   ) : null)}
                  <span className={`text-xs ${message.sender === 'user' ? 'text-accent/70' : 'text-primary/70'} font-mono`}>
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-md bg-accent/80 flex items-center justify-center text-background flex-shrink-0 ml-2 border border-accent shadow-[0_0_8px_rgba(255,0,255,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="border-t border-primary/30 p-3 flex bg-background/90">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={t('typeYourDesignRequest')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="pr-8 bg-background/80 border-primary/40 text-foreground placeholder:text-primary/40 focus:border-primary/80 focus:ring-primary/20 font-mono shadow-[0_0_10px_rgba(0,255,255,0.1)]"
            disabled={isSending}
          />
          <div className="absolute right-2 top-2 h-5 w-5">
            <VoiceCommandProcessor
              onCommand={handleVoiceCommand}
              disabled={isSending || isVoiceProcessing}
              isProcessing={isVoiceProcessing}
              language="en-US" // Change to Egyptian Arabic with "ar-EG" if needed
            />
          </div>
        </div>
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim() || isSending}
          className="ml-2 bg-primary/90 hover:bg-primary text-background font-semibold border border-primary cyberpunk-glow"
        >
          {isSending ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </section>
  );
}
