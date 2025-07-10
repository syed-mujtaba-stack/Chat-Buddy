// src/ai/flows/retain-conversation-context.ts
'use server';

/**
 * @fileOverview Retains the conversation context in local memory for more coherent interactions.
 *
 * - retainConversationContext - A function that retains conversation context and interacts with the AI.
 * - RetainConversationContextInput - The input type for the retainConversationContext function.
 * - RetainConversationContextOutput - The return type for the retainConversationContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const RetainConversationContextInputSchema = z.object({
  newMessage: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(MessageSchema).optional().describe('The history of the conversation as JSON array.'),
  systemPrompt: z.string().optional().describe('System prompt to guide the conversation'),
  model: z.string().optional().describe('The model selected by the user'),
  fileContent: z.string().nullable().optional().describe('The content of an uploaded file.'),
});

export type RetainConversationContextInput = z.infer<typeof RetainConversationContextInputSchema>;

const RetainConversationContextOutputSchema = z.object({
  response: z.string().describe('The AI response to the message.'),
  updatedChatHistory: z.array(MessageSchema).describe('The updated history of the conversation.'),
});

export type RetainConversationContextOutput = z.infer<typeof RetainConversationContextOutputSchema>;

export async function retainConversationContext(input: RetainConversationContextInput): Promise<RetainConversationContextOutput> {
  return retainConversationContextFlow(input);
}

const retainConversationContextPrompt = ai.definePrompt({
  name: 'retainConversationContextPrompt',
  input: {
    schema: RetainConversationContextInputSchema,
  },
  output: {
    schema: RetainConversationContextOutputSchema,
  },
  prompt: `You are a helpful AI assistant.  Use the chat history to respond in a relevant way to the user.
{{#if systemPrompt}}
System prompt: {{systemPrompt}}
{{/if}}

{{#if fileContent}}
The user has provided the following file content for context. Use this file to answer the user's prompt.

File Content:
\`\`\`
{{fileContent}}
\`\`\`
{{/if}}

Chat History:
{{#each chatHistory}}
  {{role}}: {{content}}
{{/each}}

User: {{newMessage}}

Assistant: `,
});

const retainConversationContextFlow = ai.defineFlow(
  {
    name: 'retainConversationContextFlow',
    inputSchema: RetainConversationContextInputSchema,
    outputSchema: RetainConversationContextOutputSchema,
  },
  async input => {
    const {
      newMessage,
      chatHistory = [],
      systemPrompt = 'You are a helpful AI assistant.',
      model = 'googleai/gemini-2.0-flash'
    } = input;

    const currentMessage = { role: 'user', content: newMessage } as const;
    const updatedChatHistory = [...chatHistory, currentMessage];

    const promptResult = await retainConversationContextPrompt({
      ...input,
      chatHistory: updatedChatHistory,
      systemPrompt,
    }, { model });

    const aiResponse = promptResult.output?.response ?? 'An error occurred.';
    const assistantMessage = { role: 'assistant', content: aiResponse } as const;
    const finalChatHistory = [...updatedChatHistory, assistantMessage];

    return {
      response: aiResponse,
      updatedChatHistory: finalChatHistory,
    };
  }
);
