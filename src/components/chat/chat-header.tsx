'use client';

import {
  Save,
  Settings,
  Trash2,
  FileJson,
  FileText,
  FileCode,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SettingsDialog, type SettingsProps } from './settings-dialog';

interface ChatHeaderProps {
  onClear: () => void;
  onSave: (format: 'json' | 'md' | 'txt') => void;
  settings: SettingsProps;
}

export function ChatHeader({ onClear, onSave, settings }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-2">
        <Bot className="w-6 h-6 text-accent" />
        <h1 className="text-xl font-bold font-headline">Python Chat Buddy</h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Save chat">
              <Save className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onSave('md')}>
              <FileCode className="w-4 h-4 mr-2" />
              Save as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSave('json')}>
              <FileJson className="w-4 h-4 mr-2" />
              Save as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSave('txt')}>
              <FileText className="w-4 h-4 mr-2" />
              Save as Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          aria-label="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
        </Button>

        <SettingsDialog {...settings} />
      </div>
    </header>
  );
}
