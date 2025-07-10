
'use client';

import * as React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarSeparator, SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Trash2, Code, Component, PencilRuler, Image as ImageIcon, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { type ChatSession } from '@/lib/types';
import { usePathname } from 'next/navigation';

const courses = [
    { name: 'Python', icon: Code, path: '/course/python' },
    { name: 'JavaScript', icon: Code, path: '/course/javascript' },
    { name: 'C++', icon: Code, path: '/course/cplusplus' },
    { name: 'React', icon: Component, path: '/course/react' },
];

const tools = [
    { name: 'Story Generator', icon: PencilRuler, path: '/story-generator' },
    { name: 'Image Generator', icon: ImageIcon, path: '/image-generator' },
    { name: 'Data Analyst', icon: BarChart2, path: '/data-analyst' },
];

interface MainLayoutProps {
    children: React.ReactNode;
    sessions: ChatSession[];
    activeSessionId: string | null;
    setActiveSessionId: (id: string) => void;
    handleNewSession: () => void;
    handleDeleteSession: (id: string) => void;
}

export function MainLayout({ children, sessions, activeSessionId, setActiveSessionId, handleNewSession, handleDeleteSession }: MainLayoutProps) {
    const pathname = usePathname();

    const isHomePage = pathname === '/';

    return (
        <div className="flex flex-row h-screen bg-background text-foreground">
            <Sidebar>
                <SidebarHeader>
                    <Link href="/" passHref>
                        <h2 className="text-lg font-semibold p-2 cursor-pointer">AI Tutor</h2>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Courses</SidebarGroupLabel>
                        <SidebarMenu>
                            {courses.map(course => (
                                <SidebarMenuItem key={course.path}>
                                    <Link href={course.path} passHref>
                                        <SidebarMenuButton 
                                            className="w-full justify-start"
                                            isActive={pathname === course.path}
                                        >
                                            <course.icon className="w-4 h-4 mr-2" />
                                            {course.name}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                    <SidebarSeparator />
                     <SidebarGroup>
                        <SidebarGroupLabel>Tools</SidebarGroupLabel>
                        <SidebarMenu>
                            {tools.map(tool => (
                                <SidebarMenuItem key={tool.path}>
                                    <Link href={tool.path} passHref>
                                        <SidebarMenuButton 
                                            className="w-full justify-start"
                                            isActive={pathname === tool.path}
                                        >
                                            <tool.icon className="w-4 h-4 mr-2" />
                                            {tool.name}
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                    <SidebarSeparator />
                    {isHomePage && (
                        <SidebarGroup>
                            <div className="flex items-center justify-between">
                                <SidebarGroupLabel>Chats</SidebarGroupLabel>
                                <Button variant="ghost" size="icon" onClick={handleNewSession} className="h-7 w-7">
                                    <MessageSquarePlus className="w-4 h-4" />
                                </Button>
                            </div>
                            <SidebarMenu>
                                {sessions.map(session => (
                                    <SidebarMenuItem key={session.id}>
                                        <SidebarMenuButton 
                                            isActive={session.id === activeSessionId} 
                                            onClick={() => setActiveSessionId(session.id)}
                                            className="justify-start w-full"
                                        >
                                            <span className="truncate flex-1 text-left">{session.messages[0]?.content || 'New Chat'}</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuAction onClick={() => handleDeleteSession(session.id)}>
                                            <Trash2 />
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    )}
                </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex flex-col flex-1">
                {children}
            </SidebarInset>
        </div>
    );
}
