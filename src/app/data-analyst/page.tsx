// src/app/data-analyst/page.tsx
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, BarChart, LineChart, PieChart, FileQuestion, FileText, Table } from 'lucide-react';
import Link from 'next/link';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { analyzeData, type AnalyzeDataOutput } from '@/ai/flows/analyze-data';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, Cell } from "recharts"

const CHART_ICONS = {
  bar: BarChart,
  line: LineChart,
  pie: PieChart,
};

export default function DataAnalystPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [prompt, setPrompt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeDataOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a CSV file.',
        });
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
    }
  };

  const handleAnalyzeData = async () => {
    if (!file) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please upload a CSV file.' });
      return;
    }
    if (!prompt.trim()) {
      toast({ variant: 'destructive', title: 'Prompt is required', description: 'Please enter a prompt for the analysis.' });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvData = event.target?.result as string;
        try {
          const result = await analyzeData({ csvData, prompt });
          setAnalysisResult(result);
        } catch (error) {
          console.error('Data Analysis Error:', error);
          toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the data. Please check the file and try again.' });
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
         toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the selected file.' });
         setIsLoading(false);
      }
      reader.readAsText(file);
    } catch (error) {
       console.error('File Read Error:', error);
       toast({ variant: 'destructive', title: 'An unexpected error occurred.', description: 'Please try again.' });
       setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!analysisResult?.chart) return null;
    
    const { type, data, config, dataKey, categories } = analysisResult.chart;
    const chartConfig = config as any;

    const ChartIcon = CHART_ICONS[type] || BarChart;

    switch (type) {
      case 'bar':
        return (
          <RechartsBarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={dataKey} tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {categories.map((cat) => (
              <Bar key={cat} dataKey={cat} fill={`var(--color-${cat})`} radius={4} />
            ))}
          </RechartsBarChart>
        );
      case 'line':
        return (
          <RechartsLineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={dataKey} tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {categories.map((cat) => (
               <Line key={cat} type="monotone" dataKey={cat} stroke={`var(--color-${cat})`} strokeWidth={2} dot={false} />
            ))}
          </RechartsLineChart>
        );
      case 'pie':
        return (
           <RechartsPieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={data} dataKey={categories[0]} nameKey={dataKey} innerRadius={60}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry[dataKey]})`} />
                 ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent />} />
           </RechartsPieChart>
        );
      default:
        return <p>Unsupported chart type.</p>;
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
                <SidebarMenuButton className="w-full justify-start">Code Assistant</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/image-generator" passHref>
                <SidebarMenuButton className="w-full justify-start">Image Generator</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/story-generator" passHref>
                <SidebarMenuButton className="w-full justify-start">Story Generator</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/data-analyst" passHref>
                <SidebarMenuButton className="w-full justify-start" isActive={true}>Data Analyst</SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1 p-4">
        <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Data Analyst</CardTitle>
                    <CardDescription>Upload a CSV, ask a question, and get AI-powered analysis and visualizations.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4">
                         <div className="flex-1 flex flex-col gap-2">
                             <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                                 <Upload className="mr-2" /> {file ? 'Change File' : 'Upload CSV'}
                             </Button>
                             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                             {file && <p className="text-sm text-muted-foreground text-center">Selected: {file.name}</p>}
                         </div>
                         <Textarea
                             value={prompt}
                             onChange={(e) => setPrompt(e.target.value)}
                             placeholder="e.g., 'What are the total sales per region? Show me a bar chart.'"
                             className="flex-1"
                             disabled={isLoading || !file}
                         />
                    </div>
                    <Button onClick={handleAnalyzeData} disabled={isLoading || !file || !prompt}>
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Data'}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
              <Card className="flex-1 flex flex-col items-center justify-center bg-muted/40 text-muted-foreground p-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-lg">Analyzing your data, please wait...</p>
              </Card>
            )}

            {!isLoading && !analysisResult && (
              <Card className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground border-2 border-dashed p-8">
                <FileQuestion className="w-16 h-16 text-primary/50" />
                <h3 className="mt-4 text-xl font-semibold">Your Analysis Will Appear Here</h3>
                <p>Upload a CSV and ask a question to get started.</p>
              </Card>
            )}

            {analysisResult && (
              <div className="grid md:grid-cols-2 gap-4 flex-1">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText /> Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <p className="whitespace-pre-wrap">{analysisResult.analysis}</p>
                    </CardContent>
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           {React.createElement(CHART_ICONS[analysisResult.chart.type] || Table, {})}
                           Visualization
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer config={analysisResult.chart.config} className="h-full w-full">
                           {renderChart()}
                        </ChartContainer>
                    </CardContent>
                </Card>
              </div>
            )}
        </div>
      </SidebarInset>
    </div>
  );
}
