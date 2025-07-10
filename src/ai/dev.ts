import { config } from 'dotenv';
config();

import '@/ai/flows/retain-conversation-context.ts';
import '@/ai/flows/generate-response.ts';
import '@/ai/flows/text-to-speech.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/generate-story.ts';
import '@/ai/flows/analyze-data.ts';
