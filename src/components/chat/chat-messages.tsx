'use client';

import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type Message } from '@/lib/types';
import { ChatMessage } from './chat-message';
import { Bot, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onRegenerate: () => void;
  onPlayAudio: (text: string) => void;
  isPlaying: boolean;
}

export function ChatMessages({ messages, isLoading, onRegenerate, onPlayAudio, isPlaying }: ChatMessagesProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const lastMessageIsAssistant = messages.length > 0 && messages[messages.length-1].role === 'assistant';

  return (
    <ScrollArea className="h-full" viewportRef={viewportRef}>
      <div className="w-full max-w-4xl p-4 mx-auto space-y-6 sm:p-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} onPlayAudio={onPlayAudio} isPlaying={isPlaying} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center text-muted-foreground">
            <Bot className="w-16 h-16 mb-4 text-accent" />
            <h2 className="text-2xl font-semibold">Welcome to your AI Code Assistant</h2>
            <p className="mt-2">
              Ask me to write, explain, or fix code in any language.
            </p>
          </div>
        )}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
          <div className="flex items-start gap-4 animate-fade-in">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary text-secondary-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        { lastMessageIsAssistant && !isLoading && (
           <div className="flex justify-end">
             <Button variant="ghost" size="icon" onClick={onRegenerate} aria-label="Regenerate response">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
             </Button>
           </div>
        )}
      </div>
    </ScrollArea>
  );
}
