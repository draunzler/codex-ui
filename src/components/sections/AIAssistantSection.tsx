'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { genshinAPI, UserResponse } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  User, 
  Brain
} from 'lucide-react';

interface AIAssistantSectionProps {
  userUID: number;
  userData?: UserResponse;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistantSection({ userUID, userData }: AIAssistantSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Genshin Impact AI assistant. I can help you with character builds, team compositions, damage calculations, farming routes, and general gameplay advice. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [placeholderFading, setPlaceholderFading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const placeholderSuggestions = [
    "What's the best team composition for my characters?",
    "How can I improve my damage output?",
    "Which artifacts should I prioritize for my main DPS?",
    "What materials do I need to level up my characters?",
    "How should I build my support characters?",
    "What's the optimal rotation for my team?",
    "Which weapons are best for my characters?",
    "How do I optimize my artifact substats?",
    "What are the current meta team compositions?",
    "How do elemental reactions work in combat?",
    "Which characters should I prioritize for investment?",
    "What's the most efficient farming route for materials?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Rotate placeholder suggestions every 3 seconds with fade animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderFading(true);
      setTimeout(() => {
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholderSuggestions.length);
        setPlaceholderFading(false);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [placeholderSuggestions.length]);

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      const response = await genshinAPI.askQuestion({
        question: content,
        uid: userUID,
        include_context: true
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer || response.response || 'I apologize, but I encountered an issue processing your question. Please try again.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-lime-accent to-success-green rounded-2xl flex items-center justify-center shadow-xl">
            <Brain className="h-6 w-6 text-dark-charcoal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-dark-charcoal via-lime-accent to-dark-charcoal bg-clip-text text-transparent">
              AI Assistant
            </h1>
            <p className="text-dark-charcoal/70 text-sm">
              Get personalized advice for builds, teams, and strategies
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col bg-gradient-to-br from-cream-white to-white border-2 border-lime-accent/20 shadow-xl min-h-0">
        <CardContent className="flex-1 flex flex-col p-6 min-h-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 min-h-0 max-h-[400px]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-accent to-success-green rounded-xl flex items-center justify-center flex-shrink-0">
                    <Image 
                      src="/CodexLogo.png" 
                      alt="Codex AI Assistant" 
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-5 rounded-2xl shadow-lg ${
                    message.isUser
                      ? 'bg-dark-charcoal text-white border-0'
                      : 'bg-white border-2 border-lime-accent/20 text-dark-charcoal'
                  }`}
                >
                  {message.isUser ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-white">
                      {message.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:text-dark-charcoal prose-p:text-dark-charcoal prose-strong:text-dark-charcoal prose-code:text-dark-charcoal prose-pre:bg-lime-accent/10 prose-pre:text-dark-charcoal prose-blockquote:text-dark-charcoal/70 prose-li:text-dark-charcoal">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for code blocks
                          code: ({ inline, children, ...props }: React.ComponentProps<'code'> & { inline?: boolean }) => {
                            return inline ? (
                              <code className="bg-lime-accent/30 text-dark-charcoal px-2 py-1 rounded text-xs font-mono font-semibold" {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="block bg-lime-accent/10 p-4 rounded-xl text-sm font-mono overflow-x-auto border border-lime-accent/20" {...props}>
                                {children}
                              </code>
                            );
                          },
                          // Custom styling for blockquotes
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-lime-accent pl-4 italic text-dark-charcoal/80 bg-lime-accent/5 py-2 rounded-r-lg">
                              {children}
                            </blockquote>
                          ),
                          // Custom styling for lists
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside space-y-2 ml-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                              {children}
                            </ol>
                          ),
                          // Custom styling for headings
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold text-dark-charcoal mb-3 pb-2 border-b-2 border-lime-accent/30">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold text-dark-charcoal mb-3">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-bold text-dark-charcoal mb-2">
                              {children}
                            </h3>
                          ),
                          // Custom styling for tables
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4">
                              <table className="min-w-full border-2 border-lime-accent/20 rounded-xl overflow-hidden">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-lime-accent/20 bg-lime-accent/10 px-4 py-3 text-left font-bold text-dark-charcoal">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-lime-accent/20 px-4 py-3 text-dark-charcoal">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className={`text-xs mt-3 ${
                    message.isUser ? 'text-white/60' : 'text-dark-charcoal/50'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
                {message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-dark-charcoal to-dark-charcoal/80 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {userData?.profile_data?.profilePicture?.icon ? (
                      <Image
                        src={userData.profile_data.profilePicture.icon}
                        alt={`${userData.profile_data?.nickname || userData.nickname || 'User'}'s profile`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <User className={`fallback-icon h-5 w-5 text-white ${userData?.profile_data?.profilePicture?.icon ? 'hidden' : ''}`} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-gradient-to-br from-lime-accent to-success-green rounded-xl flex items-center justify-center">
                  <Image 
                    src="/CodexLogo.png" 
                    alt="Codex AI Assistant" 
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <div className="bg-white border-2 border-lime-accent/20 p-5 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-lime-accent rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-lime-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-lime-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm ml-2 text-dark-charcoal/70 font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-4 bg-gradient-to-r from-lime-accent/10 to-success-green/10 rounded-2xl flex-shrink-0">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholderSuggestions[currentPlaceholderIndex]}
              disabled={loading}
              className={`flex-1 h-12 text-base border-2 border-lime-accent/30 focus:border-lime-accent focus:ring-lime-accent focus:ring-2 bg-white text-dark-charcoal rounded-xl shadow-lg font-medium transition-all duration-300 ${
                placeholderFading ? 'placeholder:opacity-30' : 'placeholder:opacity-50'
              } placeholder:transition-opacity placeholder:duration-200 placeholder:text-dark-charcoal`}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !currentMessage.trim()}
              className={`h-12 px-6 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl ${
                !(loading || !currentMessage.trim()) && messages.length > 1
                  ? 'bg-lime-accent text-dark-charcoal border-0'
                  : 'bg-lime-accent/50 text-dark-charcoal/50 border-2 border-lime-accent/20'
              }`}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 