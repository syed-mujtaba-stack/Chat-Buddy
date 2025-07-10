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
  csv: z.string().describe('The CSV data as a string.'),
  prompt: z
    .string()
    .describe('The user prompt asking a question about the data.'),
});
export type AnalyzeDataInput = z.infer<typeof AnalyzeDataInputSchema>;

const AnalyzeDataOutputSchema = z.object({
  analysis: z.string().describe("A textual summary of the data analysis based on the user's prompt. This should be in Markdown format."),
  chart: z.object({
    config: z.record(z.any()).describe("The configuration for the chart's legend and tooltips, mapping data keys to display names and colors."),
    data: z.array(z.record(z.string(), z.any())).describe("The data for the chart, as an array of objects."),
    x_axis_key: z.string().describe("The key from the data objects to use for the x-axis."),
    y_axis_keys: z.array(z.string()).describe("The key(s) from the data objects to use for the y-axis/bars."),
  }).describe("The data and configuration for generating a chart visualization."),
});
export type AnalyzeDataOutput = z.infer<typeof AnalyzeDataOutputSchema>;

export async function analyzeData(input: AnalyzeDataInput): Promise<AnalyzeDataOutput> {
  return analyzeDataFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'dataAnalysisPrompt',
  input: { schema: AnalyzeDataInputSchema },
  output: { schema: AnalyzeDataOutputSchema },
  prompt: `You are a professional data analyst. Your task is to analyze the provided CSV data based on the user's prompt. Provide a clear, concise analysis in Markdown format. Also, provide the data and configuration needed to generate a bar chart that visualizes your findings.

User Prompt:
"{{prompt}}"

CSV Data:
\`\`\`csv
{{csv}}
\`\`\`

Instructions:
1.  **Analysis**: Write a summary of your findings in the 'analysis' field. Address the user's prompt directly.
2.  **Chart Data**: Prepare the data for a bar chart in the 'chart.data' field. This should be an array of JSON objects.
3.  **Chart Configuration**:
    *   'chart.x_axis_key': Specify the key from your data objects to be used for the X-axis (e.g., 'city', 'product', 'month').
    *   'chart.y_axis_keys': Provide an array of keys from your data objects that should be plotted on the Y-axis (e.g., ['sales', 'users']).
    *   'chart.config': Create a configuration object for the chart legend. For each key in 'y_axis_keys', provide a 'label' (e.g., 'Total Sales') and a 'color' in HSL format (e.g., 'hsl(var(--chart-1))'). The color should be one of the available chart variables (--chart-1, --chart-2, etc.).

Example Chart Output Structure:
{
  "analysis": "The analysis shows that...",
  "chart": {
    "config": {
      "sales": { "label": "Total Sales", "color": "hsl(var(--chart-1))" },
      "units": { "label": "Units Sold", "color": "hsl(var(--chart-2))" }
    },
    "data": [
      { "month": "Jan", "sales": 4000, "units": 240 },
      { "month": "Feb", "sales": 3000, "units": 139 }
    ],
    "x_axis_key": "month",
    "y_axis_keys": ["sales", "units"]
  }
}
`,
});

const analyzeDataFlow = ai.defineFlow(
  {
    name: 'analyzeDataFlow',
    inputSchema: AnalyzeDataInputSchema,
    outputSchema: AnalyzeDataOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      throw new Error('Data analysis failed to produce a result.');
    }
    return output;
  }
);
