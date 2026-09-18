'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DocumentAnalysis, Clause } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Bot, User, Sparkles, X, ShieldAlert } from 'lucide-react';

interface ChatPanelProps {
  documentId: string;
  documentName: string;
  analysis?: DocumentAnalysis;
  selectedClause?: Clause;
  className?: string;
  onClearSelectedClause?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'What are the main things I should review before signing?',
  'Explain this agreement in simple plain language',
  'What obligations do I have under this contract?',
  'What should I clarify with the other party?',
  'Show me the most restrictive clauses'
];

export function ChatPanel({
  documentId,
  documentName,
  analysis,
  selectedClause,
  className,
  onClearSelectedClause,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const assistantMessageId = crypto.randomUUID();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          selectedClause: selectedClause
            ? {
                title: selectedClause.title,
                originalText: selectedClause.originalText,
                section: selectedClause.section,
                page: selectedClause.page,
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body returned');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // Temporary placeholder message
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      let accumulated = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          let chunkText = '';
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                chunkText += JSON.parse(line.slice(2));
              } catch {
                chunkText += line.slice(2);
              }
            } else if (line.trim().length > 0 && !line.startsWith('d:') && !line.startsWith('e:')) {
              chunkText += line;
            }
          }
          accumulated += chunkText;
          const currentText = accumulated;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: currentText }
                : msg
            )
          );
        }
      }

      // If stream ended empty, populate grounded document intelligence
      if (!accumulated.trim()) {
        let fallbackText = '';
        if (selectedClause) {
          fallbackText = `**Clause Focus: ${selectedClause.title} (${selectedClause.section}, Page ${selectedClause.page})**\n\n` +
            `**Legal Text:**\n> "${selectedClause.originalText}"\n\n` +
            `**Simplified Explanation:**\n${selectedClause.simplifiedExplanation || 'Establishes binding contractual terms.'}\n\n` +
            `**Why It May Matter:**\n- ${selectedClause.whyItMayMatter || 'Could impact rights or future liabilities.'}\n\n` +
            `*Source: ${documentName} · Page ${selectedClause.page}*`;
        } else if (analysis) {
          fallbackText = `**Analysis for ${documentName} (${analysis.documentType})**:\n\n` +
            `${analysis.summary}\n\n` +
            `**Key Attention Areas:**\n` +
            analysis.attentionAreas.slice(0, 3).map(a => `- **${a.title}** [${a.attentionLevel} Attention]: ${a.description}`).join('\n') +
            `\n\n*Source: ${documentName} (Pages 1-${analysis.clauses.length > 0 ? analysis.clauses[analysis.clauses.length - 1].page : 1})*`;
        } else {
          fallbackText = `I have reviewed ${documentName}. You can ask me to explain any clause, list obligations, or check important deadlines.`;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fallbackText }
              : msg
          )
        );
      }
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'Please verify your API key and connection.';
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== assistantMessageId),
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I encountered an issue processing your request: ${errMsg}. Consider reviewing the highlighted sections directly.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const renderMessageContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (!line) return <br key={i} />;
      const boldParts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-2 last:mb-0 leading-relaxed">
          {boldParts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Nyaya AI</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {documentName}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Selected clause banner */}
        {selectedClause && (
          <div className="mt-2.5 flex items-center justify-between p-2 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in">
            <div className="flex items-center gap-1.5 truncate pr-2">
              <span className="font-semibold shrink-0">Focus clause:</span>
              <span className="truncate">{selectedClause.title} ({selectedClause.section})</span>
            </div>
            {onClearSelectedClause && (
              <button
                onClick={onClearSelectedClause}
                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-100 shrink-0 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Document-Aware Legal Assistant
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-5">
                Ask questions about clauses, deadlines, obligations, or potential risks grounded in this document.
              </p>
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="text-left px-3 py-2 text-xs bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'flex w-full gap-2.5',
                m.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs',
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                )}
              >
                {renderMessageContent(m.content)}
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedClause ? `Ask about "${selectedClause.title}"...` : "Ask Nyaya AI about this document..."}
            className="text-xs sm:text-sm h-9"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mt-2">
          <ShieldAlert className="w-3 h-3 text-slate-400" />
          <span>AI legal assistance · Not legal advice · Verify with a qualified professional</span>
        </div>
      </div>
    </div>
  );
}
