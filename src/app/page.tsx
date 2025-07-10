'use client';

import * as React from 'react';
import { retainConversationContext } from '@/ai/flows/retain-conversation-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatHeader } from '@/components/chat/chat-header';

export default function Home() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [apiKey, setApiKey] = useLocalStorage('apiKey', '');
  const [model, setModel] = useLocalStorage(
    'model',
    'googleai/gemini-1.5-flash-latest'
  );
  const [systemPrompt, setSystemPrompt] = useLocalStorage(
    'systemPrompt',
    'You are Python Chat Buddy, an expert AI assistant for Python developers. Provide clear, concise, and accurate code examples and explanations. Format your responses in Markdown.'
  );

  const handleSendMessage = async (content: string) => {
    if (isLoading || !content.trim()) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await retainConversationContext({
        newMessage: content,
        chatHistory: messages,
        systemPrompt,
        model,
      });
      setMessages(result.updatedChatHistory);
    } catch (error) {
      console.error(error);
      setMessages(messages); // Revert to previous state
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description:
          'Failed to get a response from the AI. Please check your settings and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSaveChat = (format: 'json' | 'md' | 'txt') => {
    if (messages.length === 0) {
      toast({
        title: 'Empty Chat',
        description: 'There are no messages to save.',
      });
      return;
    }

    let data = '';
    let mimeType = 'text/plain';
    let fileExtension = format;

    if (format === 'json') {
      data = JSON.stringify(messages, null, 2);
      mimeType = 'application/json';
    } else if (format === 'md') {
      data = messages
        .map((m) => `**${m.role.toUpperCase()}**: \n\n${m.content}`)
        .join('\n\n---\n\n');
      mimeType = 'text/markdown';
    } else {
      data = messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
        .join('\n\n====================\n\n');
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${Date.now()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Chat Saved',
      description: `Your chat has been saved as a .${fileExtension} file.`,
    });
  };
  
  const handleRegenerate = async () => {
    if (isLoading || messages.length === 0) return;
    
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
        toast({
            variant: 'destructive',
            title: 'Cannot Regenerate',
            description: 'No user message found to regenerate a response for.',
        });
        return;
    }

    const historyWithoutLastAssistantResponse = messages.filter((_, i) => i < messages.length - 1);

    setIsLoading(true);
    setMessages(historyWithoutLastAssistantResponse);

    try {
      const result = await retainConversationContext({
        newMessage: lastUserMessage.content,
        chatHistory: historyWithoutLastAssistantResponse.filter(m => m.role !== 'user' || m.content !== lastUserMessage.content),
        systemPrompt,
        model,
      });
      setMessages(result.updatedChatHistory);
    } catch (error) {
      console.error(error);
      setMessages(messages); // Revert
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Failed to regenerate the response.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <ChatHeader
        onClear={handleClearChat}
        onSave={handleSaveChat}
        settings={{
          apiKey,
          setApiKey,
          model,
          setModel,
          systemPrompt,
          setSystemPrompt,
        }}
      />
      <main className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} onRegenerate={handleRegenerate} />
      </main>
      <footer className="p-4 border-t border-border">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
}
