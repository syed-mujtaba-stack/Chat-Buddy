
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateImage } from '@/ai/flows/generate-image';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type ChatSession } from '@/lib/types';
import * as React from 'react';


const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [],
  createdAt: new Date(),
});


export default function ImageGeneratorPage() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please enter a prompt to generate an image.',
      });
      return;
    }
    setIsLoading(true);
    setImageUrl('');
    try {
      const result = await generateImage(prompt);
      if (result?.media?.url) {
        setImageUrl(result.media.url);
      } else {
        throw new Error('Image generation failed to produce a result.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description:
          'Could not generate image. Please check the console for errors.',
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
            <h1 className="text-4xl font-bold font-headline">Image Generator</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Create stunning visuals with the power of AI.
            </p>
        </header>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Enter your prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                placeholder="e.g., A futuristic cityscape at sunset"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Image'
                )}
              </Button>
            </div>

            {imageUrl && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 text-center">Generated Image</h3>
                <div className="aspect-square relative w-full rounded-lg overflow-hidden border">
                   <Image
                      src={imageUrl}
                      alt={prompt}
                      fill
                      className="object-cover"
                      data-ai-hint="generated image"
                    />
                </div>
              </div>
            )}
            {isLoading && !imageUrl && (
                <div className="mt-8 flex justify-center items-center flex-col gap-4 text-muted-foreground">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p>AI is creating your image...</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
