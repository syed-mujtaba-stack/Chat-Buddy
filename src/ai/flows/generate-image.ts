// src/ai/flows/generate-image.ts
'use server';
/**
 * @fileOverview A flow to generate images from a text prompt.
 *
 * - generateImage - A function that generates an image.
 */
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

export const generateImage = ai.defineFlow(
  {
    name: 'generateImage',
    inputSchema: z.string(),
    outputSchema: z.object({
      media: z.object({
        url: z.string().describe('The data URI of the generated image.'),
      }),
    }),
  },
  async (prompt) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash-preview-image-generation'),
      prompt: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media) {
      throw new Error('Image generation failed to produce a result.');
    }

    return {
      media: {
        url: media.url,
      },
    };
  }
);
