// src/ai/flows/generate-story.ts
'use server';
/**
 * @fileOverview A flow to generate a short story with an illustration.
 *
 * - generateStory - A function that generates a story and an image.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe('The prompt for the story.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story text.'),
  imageUrl: z
    .string()
    .describe("The generated image as a data URI. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async ({ prompt }) => {
    // Step 1: Generate the story text.
    const storyGenerationPrompt = `Write a short, imaginative story based on the following prompt. The story should be a single paragraph.

Prompt: "${prompt}"`;
    
    const storyResponse = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: storyGenerationPrompt,
    });
    
    const story = storyResponse.text;

    // Step 2: Generate an illustration for the story.
    const imageGenerationPrompt = `Create a whimsical, storybook-style illustration for the following scene: ${story.substring(0, 200)}...`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imageGenerationPrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to produce an image for the story.');
    }

    return { story, imageUrl };
  }
);
