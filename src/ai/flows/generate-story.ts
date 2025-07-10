// src/ai/flows/generate-story.ts
'use server';
/**
 * @fileOverview A flow to generate a story with an accompanying image.
 *
 * - generateStory - A function that generates a story and an illustration.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateStoryOutputSchema = z.object({
  story: z.string().describe('The generated story text.'),
  imageUrl: z.string().describe('The URL of the generated illustration.'),
});

export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(topic: string): Promise<GenerateStoryOutput> {
    return generateStoryFlow(topic);
}

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: z.string(),
    outputSchema: GenerateStoryOutputSchema,
  },
  async (topic) => {
    // Generate story and image in parallel to save time
    const [storyResult, imageResult] = await Promise.all([
      ai.generate({
        prompt: `Write a short, imaginative story for a young adult audience based on the following topic. The story should be no more than 5 paragraphs long. Topic: "${topic}"`,
      }),
      ai.generate({
        model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
        prompt: `Generate a digital painting style illustration for a story about: "${topic}". The style should be slightly stylized and evocative, suitable for a fantasy or sci-fi book cover.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);

    const story = storyResult.text;
    const imageUrl = imageResult.media?.url;

    if (!story || !imageUrl) {
      throw new Error('Failed to generate story or image.');
    }

    return { story, imageUrl };
  }
);
