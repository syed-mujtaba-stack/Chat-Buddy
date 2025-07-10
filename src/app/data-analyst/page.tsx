
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeData, type AnalyzeDataOutput } from '@/ai/flows/analyze-data';
import { Loader2, UploadCloud, FileText, BarChart } from 'lucide-react';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from 'recharts';
import { MainLayout } from '@/components/layout';
import * as React from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type ChatSession } from '@/lib/types';


const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [],
  createdAt: new Date(),
});


export default function DataAnalystPage() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AnalyzeDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chatSessions', [createNewSession()]);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>(null);

  React.useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId, setActiveSessionId]);

  const handleNewSession = () => {
    const newSession = createNewSession();
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        if (newSessions.length === 0) {
            const newSession = createNewSession();
            setActiveSessionId(newSession.id);
            return [newSession];
        }
        if (activeSessionId === sessionId) {
            setActiveSessionId(newSessions[0].id);
        }
        return newSessions;
    });
  }


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
    }
  };

  const handleAnalyze = async () => {
    if (!file || !prompt) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please upload a CSV file and enter a prompt.',
      });
      return;
    }
    setIsLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvContent = event.target?.result as string;
      try {
        const analysisResult = await analyzeData({ csv: csvContent, prompt });
        setResult(analysisResult);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the data. Please check the console.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <MainLayout
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        handleNewSession={handleNewSession}
        handleDeleteSession={handleDeleteSession}
    >
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Data Analyst</h1>
            <p className="text-muted-foreground mt-2 text-lg">
                Upload a CSV, ask a question, and get instant insights.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>1. Upload Data</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv"
              />
              <div 
                className="border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                  <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold">
                    {file ? 'File selected:' : 'Click to upload a CSV'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : 'Max file size 5MB'}
                  </p>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>2. Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="e.g., 'What are the top 5 selling products?'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
              />
            </CardContent>
             <CardContent>
                <Button onClick={handleAnalyze} disabled={isLoading || !file || !prompt} className="w-full">
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                    ) : (
                    'Analyze Data'
                    )}
                </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            {isLoading && (
              <Card className="h-[500px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p>AI is analyzing your data...</p>
                  </div>
              </Card>
            )}
            {!isLoading && !result && (
                <Card className="h-[500px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground text-center">
                    <BarChart className="w-16 h-16 mb-4" />
                    <h3 className="text-xl font-semibold">Your Analysis Will Appear Here</h3>
                    <p>Upload a CSV and ask a question to get started.</p>
                  </div>
              </Card>
            )}
            {result && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarkdownRenderer content={result.analysis} />
                  </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><BarChart /> Visualization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={result.chart.config} className="min-h-[300px] w-full">
                        <RechartsBarChart data={result.chart.data}>
                           <CartesianGrid vertical={false} />
                           <XAxis dataKey={result.chart.x_axis_key} tickLine={false} tickMargin={10} axisLine={false} />
                           <YAxis />
                           <ChartTooltip content={<ChartTooltipContent />} />
                           <ChartLegend content={<ChartLegendContent />} />
                           {result.chart.y_axis_keys.map(key => (
                             <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
                           ))}
                        </RechartsBarChart>
                      </ChartContainer>
                    </CardContent>
                 </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
