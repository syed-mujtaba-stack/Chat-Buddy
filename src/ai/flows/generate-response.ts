// src/ai/flows/generate-response.ts
'use server';
/**
 * @fileOverview A flow to generate AI responses based on user prompts.
 *
 * - generateResponse - A function that generates AI responses.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResponseInputSchema = z.object({
  prompt: z.string().describe('The user prompt to generate a response for.'),
  model: z.string().describe('The model to use for generating the response.'),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});

export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The AI generated response.'),
});

export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

const generateResponsePrompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: { schema: GenerateResponseInputSchema },
  output: { schema: GenerateResponseOutputSchema },
  prompt: `You are a helpful AI assistant.  Use the conversation history to respond to the user prompt.

Conversation history:
{{#each history}}
{{role}}: {{content}}
{{/each}}

User prompt: {{{prompt}}}`,
  model: `{{{model}}}`,
});

const generateResponseFlow = ai.defineFlow(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    const { output } = await generateResponsePrompt(input);
    return output!;
  }
);
