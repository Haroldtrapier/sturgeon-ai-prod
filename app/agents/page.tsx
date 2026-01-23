'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentType?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

const AGENTS: Agent[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Ask me anything about opportunities, contracts, and proposals',
    icon: '🤖',
    systemPrompt: 'You are a helpful AI assistant for Sturgeon AI, a government contracting platform. Help users with general questions about opportunities, proposals, and the platform.'
  },
  {
    id: 'contract-analysis',
    name: 'Contract Analyzer',
    description: 'Deep analysis of RFPs, solicitations, and contract documents',
    icon: '📄',
    systemPrompt: 'You are a contract analysis expert. Analyze RFPs, identify key requirements, deadlines, evaluation criteria, and compliance needs. Provide structured analysis with risk assessments.'
  },
  {
    id: 'proposal-writer',
    name: 'Proposal Writer',
    description: 'Generate proposal sections, technical approaches, and narratives',
    icon: '✍️',
    systemPrompt: 'You are an expert proposal writer for government contracts. Create compelling, compliant proposal sections including technical approaches, management plans, and past performance narratives.'
  },
  {
    id: 'compliance',
    name: 'Compliance Checker',
    description: 'Verify FAR/DFARS compliance and regulatory requirements',
    icon: '⚖️',
    systemPrompt: 'You are a compliance expert specializing in FAR, DFARS, and government contracting regulations. Check proposals for compliance issues, flag potential problems, and suggest corrections.'
  },
  {
    id: 'pricing',
    name: 'Pricing Strategist',
    description: 'Cost estimation, pricing strategies, and BOE development',
    icon: '💰',
    systemPrompt: 'You are a pricing and cost estimation expert for government contracts. Provide pricing strategies, develop basis of estimates (BOE), and analyze competitive pricing approaches.'
  },
  {
    id: 'technical',
    name: 'Technical Writer',
    description: 'Write technical approaches, SOWs, and solution architectures',
    icon: '🔧',
    systemPrompt: 'You are a technical writing expert for government contracts. Create detailed technical approaches, statements of work, solution architectures, and implementation plans.'
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Find similar contracts, past performance examples, and market research',
    icon: '🔍',
    systemPrompt: 'You are a research specialist. Find relevant past contracts, similar opportunities, market research, and competitive intelligence to support proposal development.'
  },
  {
    id: 'sam-search',
    name: 'SAM.gov Navigator',
    description: 'Smart search across SAM.gov opportunities with advanced filtering',
    icon: '🎯',
    systemPrompt: 'You are a SAM.gov search expert with live access to the SAM.gov opportunities database. When users ask you to find contracts:\n\n1. Extract keywords from their request (e.g., "AI", "cybersecurity", "cloud computing")\n2. Tell them you\'re searching SAM.gov for matching opportunities\n3. Provide a structured response with:\n   - Number of opportunities found\n   - Top 5-10 most relevant contracts with:\n     * Title and solicitation number\n     * Agency/Department\n     * Response deadline\n     * NAICS code\n     * Brief description\n     * Link to full details\n\nIMPORTANT: When a user asks you to find contracts, IMMEDIATELY inform them that you can search SAM.gov live, then explain that the search functionality is being activated and they should ask specific questions like:\n- "Find AI contracts for me"\n- "Show me cybersecurity opportunities"\n- "Search for cloud computing contracts under $5M"\n\nHelp users refine their searches with filters like date ranges, agencies, NAICS codes, and contract types.'
  },
  {
    id: 'requirements',
    name: 'Requirements Analyst',
    description: 'Extract and analyze RFP requirements, specifications, and deliverables',
    icon: '📋',
    systemPrompt: 'You are a requirements analysis expert. Extract all requirements from solicitations, categorize them (technical, management, compliance), and create compliance matrices.'
  },
  {
    id: 'risk',
    name: 'Risk Assessor',
    description: 'Identify project risks, mitigation strategies, and bid/no-bid analysis',
    icon: '⚠️',
    systemPrompt: 'You are a risk assessment expert. Analyze opportunities for technical, financial, and compliance risks. Provide mitigation strategies and bid/no-bid recommendations.'
  }
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent>(AGENTS[0]);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      agentType: selectedAgent.id,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          agentType: selectedAgent.id,
          systemPrompt: selectedAgent.systemPrompt,
          context: {} 
        }),
      });

      const data = await response.json();

      const agentMessage: ChatMessage = {
        role: 'agent',
        content: data.reply || data.error || 'No response received',
        timestamp: new Date(),
        agentType: selectedAgent.id,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        role: 'agent',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
        agentType: selectedAgent.id,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">AI Agents</h1>
          <p className="text-slate-400 mt-1">
            Choose a specialized agent for your task
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold mb-3">Select Agent</h2>
            {AGENTS.map((agent) => (
              <Card
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent);
                  setMessages([]);
                }}
                className={`cursor-pointer transition-all border ${
                  selectedAgent.id === agent.id
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-slate-700 hover:border-emerald-500/50 bg-slate-900/50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {agent.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)]">
            <Card className="flex-1 flex flex-col bg-slate-900/50 border-slate-800">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedAgent.icon}</span>
                  <div>
                    <h2 className="font-bold text-lg">{selectedAgent.name}</h2>
                    <p className="text-sm text-slate-400">{selectedAgent.description}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-500 mt-8">
                    <p className="mb-2">👋 {selectedAgent.name} ready to help!</p>
                    <p className="text-sm">Start by asking a question...</p>
                  </div>
                ) : (
                  messages
                    .filter((msg) => msg.agentType === selectedAgent.id)
                    .map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            msg.role === 'user'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          <div className="text-sm font-semibold mb-1">
                            {msg.role === 'user' ? 'You' : selectedAgent.icon + ' ' + selectedAgent.name}
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                          <div className="text-xs opacity-60 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                )}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-100 rounded-lg px-4 py-3 max-w-[80%]">
                      <div className="text-sm font-semibold mb-1">{selectedAgent.icon} {selectedAgent.name}</div>
                      <div className="text-sm text-slate-400 animate-pulse">Thinking...</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Ask ${selectedAgent.name} anything... (Press Enter to send)`}
                    rows={2}
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}