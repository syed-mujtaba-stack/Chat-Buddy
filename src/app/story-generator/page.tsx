
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateStory } from '@/ai/flows/generate-story';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { MainLayout } from '@/components/layout';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type ChatSession } from '@/lib/types';
import * as React from 'react';


const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [],
  createdAt: new Date(),
});


export default function StoryGeneratorPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chatSessions', [createNewSession()]);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>(null);

  React.useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId, setActiveSessionId]);

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

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        variant: 'destructive',
        title: 'Topic is required',
        description: 'Please enter a topic for the story.',
      });
      return;
    }
    setIsLoading(true);
    setStory(null);
    setImageUrl(null);
    try {
      const result = await generateStory(topic);
      setStory(result.story);
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          'Could not generate story. Please check the console for errors.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        handleNewSession={handleNewSession}
        handleDeleteSession={handleDeleteSession}
    >
        <div className="container mx-auto p-4 md:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline">Story Generator</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Bring your ideas to life with an AI-generated story and illustration.
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card>
                    <CardHeader>
                        <CardTitle>Enter a topic</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                        <Textarea
                            placeholder="e.g., A lost robot searching for its creator in a dense jungle"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                        />
                        <Button onClick={handleGenerate} disabled={isLoading}>
                            {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                            ) : (
                            'Generate Story'
                            )}
                        </Button>
                        </div>
                    </CardContent>
                    </Card>
                </div>
                <div>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p>AI is crafting your story...</p>
                    </div>
                )}
                {story && imageUrl && (
                    <Card>
                    <CardHeader>
                        <CardTitle>Your AI-Generated Story</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-[4/3] relative w-full rounded-lg overflow-hidden border mb-4">
                            <Image
                                src={imageUrl}
                                alt={topic}
                                fill
                                className="object-cover"
                                data-ai-hint="story illustration"
                            />
                        </div>
                        <div className="prose prose-sm md:prose-base max-w-none prose-p:whitespace-pre-wrap font-body prose-headings:font-headline">
                           <MarkdownRenderer content={story} />
                        </div>
                    </CardContent>
                    </Card>
                )}
                </div>
            </div>
        </div>
    </MainLayout>
  );
}
