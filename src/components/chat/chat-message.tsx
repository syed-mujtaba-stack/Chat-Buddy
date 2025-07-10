import { type Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Bot, User, Volume2, Pause } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatMessageProps {
  message: Message;
  onPlayAudio: (text: string) => void;
  isPlaying: boolean;
}

export function ChatMessage({ message, onPlayAudio, isPlaying }: ChatMessageProps) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'group flex items-start gap-4 animate-fade-in',
        isUser && 'justify-end'
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-2xl px-4 py-3 rounded-lg shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        <MarkdownRenderer content={message.content} />
      </div>
      {isUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback>
            <User className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}
      {!isUser && (
         <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onPlayAudio(message.content)}
         >
            {isPlaying ? <Pause className="w-4 h-4"/> : <Volume2 className="w-4 h-4"/>}
         </Button>
      )}
    </div>
  );
}
