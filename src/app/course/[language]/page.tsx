
'use client';

import { MainLayout } from '@/components/layout';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type ChatSession } from '@/lib/types';
import * as React from 'react';
import { notFound, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const createNewSession = (): ChatSession => ({
  id: Date.now().toString(),
  messages: [],
  createdAt: new Date(),
});

const courseData: { [key: string]: { name: string; description: string; topics: string[] } } = {
  python: {
    name: 'Python Programming',
    description: 'Master the basics and advanced concepts of Python.',
    topics: ['Introduction to Python', 'Variables and Data Types', 'Control Flow', 'Functions', 'Object-Oriented Programming', 'Modules and Packages'],
  },
  javascript: {
    name: 'JavaScript Fundamentals',
    description: 'Learn the language of the web, from basics to modern frameworks.',
    topics: ['Introduction to JavaScript', 'DOM Manipulation', 'Asynchronous JavaScript', 'ES6+ Features', 'Introduction to React', 'Node.js Basics'],
  },
  cplusplus: {
    name: 'C++ for Beginners',
    description: 'Get started with this powerful language used for systems programming and game development.',
    topics: ['Introduction to C++', 'Pointers and References', 'Classes and Objects', 'Standard Template Library (STL)', 'Memory Management'],
  },
  react: {
    name: 'Modern Web Development with React',
    description: 'Build dynamic and interactive user interfaces with the React library.',
    topics: ['Introduction to React & JSX', 'Components and Props', 'State and Lifecycle', 'Hooks', 'React Router', 'State Management (Redux/Zustand)'],
  },
};

export default function CoursePage({ params }: { params: { language: string } }) {
  const { language } = params;
  const course = courseData[language];
  const pathname = usePathname();

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

  if (!course) {
    notFound();
  }

  return (
    <MainLayout
        sessions={sessions}
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        handleNewSession={handleNewSession}
        handleDeleteSession={handleDeleteSession}
    >
      <div className="flex-1 p-6 overflow-auto">
        <header className="mb-8">
            <h1 className="text-4xl font-bold font-headline">{course.name}</h1>
            <p className="text-muted-foreground mt-2 text-lg">{course.description}</p>
        </header>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Progress value={33} className="w-[60%]" />
                    <span className="font-medium text-muted-foreground">33% Complete</span>
                </div>
            </CardContent>
        </Card>

        <section>
            <h2 className="text-2xl font-bold mb-4">Course Topics</h2>
            <div className="space-y-4">
                {course.topics.map((topic, index) => (
                    <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                <span className="text-lg font-medium">{topic}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">Completed</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      </div>
    </MainLayout>
  );
}
