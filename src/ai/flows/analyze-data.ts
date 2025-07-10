// src/ai/flows/analyze-data.ts
'use server';
/**
 * @fileOverview A flow to analyze CSV data and generate insights and charts.
 *
 * - analyzeData - A function that analyzes CSV data.
 * - AnalyzeDataInput - The input type for the analyzeData function.
 * - AnalyzeDataOutput - The return type for the analyzeData function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeDataInputSchema = z.object({
  csvData: z.string().describe('The CSV data as a string.'),
  prompt: z
    .string()
    .describe('The user prompt asking for specific analysis of the data.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

const chartConfigSchema = z.record(
    z.object({
        label: z.string(),
        color: z.string().optional(),
    })
);

const AnalyzeDataOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      "A textual summary of the data analysis based on the user's prompt."
    ),
  chart: z.object({
    type: z
      .enum(['bar', 'line', 'pie'])
      .describe('The recommended chart type.'),
    data: z
      .array(z.any())
      .describe('The data for the chart, as an array of objects.'),
    config: chartConfigSchema.describe('The configuration for the chart, mapping keys to labels and colors.'),
    dataKey: z.string().describe("The key from the data objects to use for the x-axis or pie chart name."),
    categories: z.array(z.string()).describe("The key(s) from the data objects to use for the y-axis (bar/line) or value (pie)."),
  }),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

export async function analyzeData(
  input: AnalyzeDataInput
): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}

const analyzeDataPrompt = ai.definePrompt({
  name: 'analyzeDataPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  prompt: `You are an expert data analyst. Your task is to analyze the provided CSV data based on the user's prompt. Provide a clear, concise text analysis and the necessary data and configuration to generate a relevant chart.

- Review the CSV data and the user's prompt carefully.
- Provide a detailed text analysis answering the user's question.
- Determine the best chart type (bar, line, or pie) to visualize the answer.
- Prepare the data for the chart. The data should be an array of objects.
- Create a chart configuration object. The keys of this object should match the keys in your chart data array. For each key, provide a user-friendly label. You can optionally suggest a hex color code.
- Identify the 'dataKey' for the chart (the primary dimension, like the x-axis or pie labels).
- Identify the 'categories' for the chart (the values being measured, like y-axis bars or pie values).

User Prompt: {{{prompt}}}

CSV Data:
\`\`\`csv
{{{csvData}}}
\`\`\`
`,
});

const analyzeDataFlow = ai.defineFlow(
  {
    name: 'analyzeDataFlow',
    inputSchema: AnalyzeDataInputSchema,
    outputSchema: AnalyzeDataOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeDataPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the AI model.');
    }
    return output;
  }
);
