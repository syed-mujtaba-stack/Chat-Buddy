export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatSession = {
    id: string;
    messages: Message[];
    createdAt: Date;
}
