// src/app/story-generator/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookImage } from 'lucide-react';
import Image from 'next/image';
import { generateStory } from '@/ai/flows/generate-story';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';

export default function StoryGeneratorPage() {
  const [prompt, setPrompt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [storyResult, setStoryResult] = React.useState<{ story: string; imageUrl: string } | null>(null);
  const { toast } = useToast();

  const handleGenerateStory = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please enter a prompt to generate a story.',
      });
      return;
    }
    setIsLoading(true);
    setStoryResult(null);
    try {
      const result = await generateStory({ prompt });
      setStoryResult(result);
    } catch (error) {
      console.error('Story Generation Error:', error);
      toast({
        variant: 'destructive',
        title: 'Story Generation Failed',
        description: 'Could not generate the story. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-row h-screen bg-background text-foreground">
      <Sidebar>
        <SidebarHeader>
          <h2 className="text-lg font-semibold p-2">Features</h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton className="w-full justify-start">
                  Code Assistant
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/image-generator" passHref>
                <SidebarMenuButton className="w-full justify-start">
                  Image Generator
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/story-generator" passHref>
                <SidebarMenuButton className="w-full justify-start" isActive={true}>
                  Story Generator
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Story Generator</CardTitle>
            <CardDescription>Enter a prompt and let AI create a story with an illustration for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A robot who discovers a hidden garden on Mars"
                  disabled={isLoading}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
                />
                <Button onClick={handleGenerateStory} disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
                </Button>
              </div>

              {isLoading && (
                <div className="w-full aspect-video rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/40 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="mt-2">Generating your story and illustration...</p>
                </div>
              )}
              
              {!isLoading && !storyResult && (
                <div className="w-full aspect-video rounded-md border border-dashed flex flex-col items-center justify-center bg-muted/40 text-muted-foreground">
                  <BookImage className="w-8 h-8" />
                  <p className="mt-2">Your generated story will appear here.</p>
                </div>
              )}

              {storyResult && (
                <div className="grid md:grid-cols-2 gap-4 items-start">
                   <div className="w-full aspect-square rounded-md border flex items-center justify-center bg-muted/40">
                    <Image
                      src={storyResult.imageUrl}
                      alt={`Illustration for: ${prompt}`}
                      width={512}
                      height={512}
                      className="object-contain w-full h-full rounded-md"
                      data-ai-hint="story illustration"
                    />
                  </div>
                  <div className="rounded-md border p-4 bg-muted/40 h-full">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{storyResult.story}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </SidebarInset>
    </div>
  );
}
