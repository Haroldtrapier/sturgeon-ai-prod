// pages/chat.tsx
import type { NextPage } from 'next';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';

const ChatPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>AI Chat - Sturgeon AI Assistant</title>
      </Head>
      <main>
        <ChatInterface />
      </main>
    </div>
  );
};

export default ChatPage;