import type { NextPage } from 'next';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';

const ChatPage: NextPage = () => (
  <>
    <Head>
      <title>AI Chat - Sturgeon AI Assistant</title>
    </Head>
    <ChatInterface />
  </>
);

export default ChatPage;