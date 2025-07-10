'use client';

import * as React from 'react';
import { Send, Loader2, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (content: string, fileContent: string | null) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const { toast } = useToast();
  const [content, setContent] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        const fileContent = readEvent.target?.result as string;
        onSendMessage(content, fileContent);
        setContent('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'File Read Error',
          description: 'Could not read the selected file.',
        });
      };
      reader.readAsText(file);
    } else {
      onSendMessage(content, null);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // 5MB limit
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File Too Large',
                description: 'Please select a file smaller than 5MB.',
            });
            return;
        }
      setFile(selectedFile);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl gap-2 mx-auto">
      {file && (
        <div className="flex items-center justify-between p-2 text-sm rounded-md bg-muted text-muted-foreground">
          <span className="truncate">Attached: {file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => {
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-start w-full gap-4"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".py,.txt,.md,.json,.html,.css,.js,.ts,.java,.cs,.cpp,.c,.go,.rs,.rb,.php"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me to write, explain, or fix some code..."
          className="flex-1 resize-none max-h-48"
          rows={1}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !content.trim()}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </form>
    </div>
  );
}
