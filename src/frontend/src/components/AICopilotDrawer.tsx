import React, { useState, useEffect, useRef } from 'react';
import { queryCopilot } from '../api';
import { Bot, Send, X, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

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
        "Why is Site C high risk?",
        "Show me all major deviations",
        "Which site needs immediate attention?",
        "Summarize recent deviations",
        "Generate a CAPA report for Site C"
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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-dark-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-white text-sm">IBM Bob AI Copilot</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-blue-400" />
                Data-Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Clinical trial risk decision support assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700">
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
              className={`max-w-[90%] p-3.5 rounded-2xl ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/10'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text.split('\n').map((line, lIdx) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={lIdx} className="font-bold text-white my-1">{line.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={lIdx} className="my-0.5">{line.replace(/\*\*/g, '')}</p>;
                })}
              </div>

              {/* Data Context Badge */}
              {msg.data_context && (
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center space-x-1 text-[10px] text-blue-400 font-mono">
                  <CheckCircle2 className="h-3 w-3" />
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
                    className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 hover:border-blue-500/50 rounded-lg text-[11px] font-medium transition-all flex items-center space-x-1"
                  >
                    <span>{act}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 p-3 bg-slate-800/50 rounded-xl max-w-[70%]">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-xs">Analyzing trial telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Bar */}
      <div className="p-3 bg-slate-800/90 border-t border-slate-700">
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
            className="flex-1 px-4 py-2.5 bg-dark-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
