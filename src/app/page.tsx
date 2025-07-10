'use client';

import * as React from 'react';
import { retainConversationContext } from '@/ai/flows/retain-conversation-context';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Message, type ChatSession } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatHeader } from '@/components/chat/chat-header';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Trash2 } from 'lucide-react';

const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [],
  createdAt: new Date(),
});

export default function Home() {
  const { toast } = useToast();
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chatSessions', [createNewSession()]);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>('activeChatSessionId', sessions[0]?.id ?? null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [audioPlayer, setAudioPlayer] = React.useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const [apiKey, setApiKey] = useLocalStorage('apiKey', '');
  const [model, setModel] = useLocalStorage(
    'model',
    'googleai/gemini-1.5-flash-latest'
  );
  const [systemPrompt, setSystemPrompt] = useLocalStorage(
    'systemPrompt',
    'You are Python Chat Buddy, an expert AI assistant for Python developers. Provide clear, concise, and accurate code examples and explanations. Format your responses in Markdown.'
  );

  const activeSession = React.useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const updateSessionMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages } : s));
  };
  
  const handleSendMessage = async (content: string, fileContent: string | null) => {
    if (isLoading || !content.trim()) return;

    if (!activeSession) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...activeSession.messages, userMessage];
    updateSessionMessages(activeSession.id, newMessages);
    setIsLoading(true);

    try {
      const result = await retainConversationContext({
        newMessage: content,
        chatHistory: activeSession.messages,
        systemPrompt,
        model,
        fileContent,
      });
      updateSessionMessages(activeSession.id, result.updatedChatHistory);
    } catch (error) {
      console.error(error);
      updateSessionMessages(activeSession.id, activeSession.messages); // Revert
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
    if (activeSession) {
      updateSessionMessages(activeSession.id, []);
    }
  };

  const handleSaveChat = (format: 'json' | 'md' | 'txt') => {
    if (!activeSession || activeSession.messages.length === 0) {
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
      data = JSON.stringify(activeSession.messages, null, 2);
      mimeType = 'application/json';
    } else if (format === 'md') {
      data = activeSession.messages
        .map((m) => `**${m.role.toUpperCase()}**: \n\n${m.content}`)
        .join('\n\n---\n\n');
      mimeType = 'text/markdown';
    } else {
      data = activeSession.messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
        .join('\n\n====================\n\n');
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${activeSession.id}.${fileExtension}`;
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
    if (isLoading || !activeSession || activeSession.messages.length === 0) return;
    
    const lastUserMessage = [...activeSession.messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
        toast({
            variant: 'destructive',
            title: 'Cannot Regenerate',
            description: 'No user message found to regenerate a response for.',
        });
        return;
    }

    const historyWithoutLastAssistantResponse = activeSession.messages.filter((_, i) => i < activeSession.messages.length - 1);
    updateSessionMessages(activeSession.id, historyWithoutLastAssistantResponse);
    setIsLoading(true);
    
    try {
      const result = await retainConversationContext({
        newMessage: lastUserMessage.content,
        chatHistory: historyWithoutLastAssistantResponse.filter(m => m.role !== 'user' || m.content !== lastUserMessage.content),
        systemPrompt,
        model,
      });
      updateSessionMessages(activeSession.id, result.updatedChatHistory);
    } catch (error) {
      console.error(error);
      updateSessionMessages(activeSession.id, activeSession.messages); // Revert
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: 'Failed to regenerate the response.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        if (newSessions.length === 0) {
            const newSession = createNewSession();
            setActiveSessionId(newSession.id);
            return [newSession];
        }
        if (activeSessionId === sessionId) {
            setActiveSessionId(newSessions[0].id);
        }
        return newSessions;
    });
  }

  const handlePlayAudio = async (text: string) => {
    if (isPlaying) {
      audioPlayer?.pause();
      setIsPlaying(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { media } = await textToSpeech(text);
      const audio = new Audio(media);
      setAudioPlayer(audio);
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("TTS Error:", error);
      toast({
        variant: "destructive",
        title: "Text-to-Speech Error",
        description: "Could not generate audio for the message.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeSession) {
    return null;
  }

  return (
    <div className="flex flex-row h-screen bg-background text-foreground">
      <Sidebar>
        <SidebarHeader>
          <Button variant="outline" onClick={handleNewSession} className="w-full">
            <MessageSquarePlus className="mr-2" /> New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {sessions.map(session => (
                    <SidebarMenuItem key={session.id}>
                        <SidebarMenuButton 
                          isActive={session.id === activeSessionId} 
                          onClick={() => setActiveSessionId(session.id)}
                          className="justify-start w-full"
                        >
                            <span className="truncate flex-1 text-left">{session.messages[0]?.content || 'New Chat'}</span>
                        </SidebarMenuButton>
                        <SidebarMenuAction onClick={() => handleDeleteSession(session.id)}>
                            <Trash2 />
                        </SidebarMenuAction>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1">
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
          <ChatMessages messages={activeSession.messages} isLoading={isLoading} onRegenerate={handleRegenerate} onPlayAudio={handlePlayAudio} isPlaying={isPlaying} />
        </main>
        <footer className="p-4 border-t border-border">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </footer>
      </SidebarInset>
    </div>
  );
}
