
'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dispatch, SetStateAction } from 'react';

export interface SettingsProps {
  apiKey: string;
  setApiKey: Dispatch<SetStateAction<string>>;
  model: string;
  setModel: Dispatch<SetStateAction<string>>;
  systemPrompt: string;
  setSystemPrompt: Dispatch<SetStateAction<string>>;
}

const models = [
  { id: 'googleai/gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'googleai/gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro' },
  { id: 'googleai/gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
];

export function SettingsDialog({
  apiKey,
  setApiKey,
  model,
  setModel,
  systemPrompt,
  setSystemPrompt,
}: SettingsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your AI Tutor preferences. All settings are saved locally.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Your API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The current backend is pre-configured and does not require a key.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">Tutor Persona</Label>
            <Textarea
              id="system-prompt"
              placeholder="Define the tutor's persona..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
