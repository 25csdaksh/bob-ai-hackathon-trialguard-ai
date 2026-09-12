import React, { useState, useEffect, useRef } from 'react';
import { queryCopilot } from '../api';
import { Bot, Send, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onNavigateTab?: (tab: string) => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  data_context?: any;
  suggested_actions?: string[];
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  onNavigateTab
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! I am **IBM Bob AI Copilot** for TrialGuard AI.\nAsk me questions about trial site risks, protocol deviations, or CAPA reports grounded directly in your trial database.",
      suggested_actions: [
        "Why is SITE-003 high risk?",
        "Show me all major deviations",
        "Which site needs immediate attention?",
        "Summarize recent deviations",
        "Generate a CAPA report for SITE-003"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSendPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: Message = { sender: 'user', text: promptText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilot(promptText);
      const botMsg: Message = {
        sender: 'bot',
        text: res.answer,
        data_context: res.data_context,
        suggested_actions: res.suggested_actions
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: "Error contacting AI Copilot backend API. Please check server logs." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-slide-left text-slate-900">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-bottle-900 rounded-xl shadow-xs text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-sm">IBM Bob AI Copilot</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-bottle-100 text-bottle-900 border border-bottle-200 rounded-full flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-bottle-800" />
                Data-Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Clinical trial risk decision support assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-bottle-900 text-white rounded-br-none font-medium'
                  : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={lIdx} className="font-bold my-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={lIdx} className="my-0.5">{line.replace(/\*\*/g, '')}</p>;
                })}
              </div>

              {/* Data Context Badge */}
              {msg.data_context && (
                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center space-x-1 text-[10px] text-bottle-800 font-mono">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Telemetry Verified: {JSON.stringify(msg.data_context)}</span>
                </div>
              )}
            </div>

            {/* Suggested Action Chips */}
            {msg.suggested_actions && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.suggested_actions.map((act, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => {
                      if (act.includes("CAPA")) {
                        if (onNavigateTab) onNavigateTab('capa');
                      }
                      handleSendPrompt(act);
                    }}
                    className="px-3 py-1 bg-white hover:bg-bottle-50 text-slate-700 hover:text-bottle-900 border border-slate-200 hover:border-bottle-300 rounded-full text-[11px] font-medium transition-colors shadow-xs flex items-center space-x-1"
                  >
                    <span>{act}</span>
                    <ArrowRight className="h-3 w-3 text-bottle-800" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-[70%]">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-bottle-800"></div>
            <span className="text-xs">Analyzing trial telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Bar */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask AI Copilot about trial risk..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-bottle-600 shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 bg-bottle-900 hover:bg-bottle-950 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
