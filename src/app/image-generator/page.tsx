// src/app/image-generator/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { generateImage } from '@/ai/flows/generate-image';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast({
        variant: 'destructive',
        title: 'Prompt is required',
        description: 'Please enter a prompt to generate an image.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedImage(null);
    try {
      const result = await generateImage({ prompt });
      if (result.imageDataUri) {
        setGeneratedImage(result.imageDataUri);
      } else {
        throw new Error('Image generation failed to return data.');
      }
    } catch (error) {
      console.error('Image Generation Error:', error);
      toast({
        variant: 'destructive',
        title: 'Image Generation Failed',
        description:
          'Could not generate the image. Please try again later.',
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
                           <SidebarMenuButton className="w-full justify-start" isActive={true}>
                                Image Generator
                           </SidebarMenuButton>
                       </Link>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                       <Link href="/story-generator" passHref>
                           <SidebarMenuButton className="w-full justify-start">
                                Story Generator
                           </SidebarMenuButton>
                       </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col flex-1 items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Image Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <Input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., A majestic lion in a futuristic city"
                                disabled={isLoading}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                            />
                            <Button onClick={handleGenerateImage} disabled={isLoading}>
                                {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                'Generate'
                                )}
                            </Button>
                        </div>

                        <div className="w-full aspect-video rounded-md border border-dashed flex items-center justify-center bg-muted/40">
                            {isLoading && (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <p>Generating your masterpiece...</p>
                                </div>
                            )}
                            {!isLoading && !generatedImage && (
                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                    <ImageIcon className="w-8 h-8" />
                                    <p>Your generated image will appear here.</p>
                                </div>
                            )}
                            {generatedImage && (
                                <Image
                                src={generatedImage}
                                alt={prompt}
                                width={512}
                                height={512}
                                className="object-contain w-full h-full rounded-md"
                                />
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </SidebarInset>
    </div>
  );
}
