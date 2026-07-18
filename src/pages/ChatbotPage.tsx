import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, TrendingUp, Shield, Brain } from 'lucide-react';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  "Should I buy NVIDIA right now?",
  "Explain MACD indicator",
  "What's the risk of Tesla?",
  "How does LSTM predict prices?",
  "Best diversification strategy?",
];

const AI_RESPONSES: Record<string, string> = {
  default: "Based on my analysis of current market conditions, technical indicators, and sentiment data, I can provide insights on your investment questions. What specific stock or topic would you like to explore?",
  nvidia: "**NVIDIA (NVDA) Analysis** 🚀\n\nCurrent Signal: **BUY** (89% confidence)\n\n📈 **Price Prediction**: $875 → $950–$1,050 (30 days)\n\n**Bullish Factors:**\n• RSI at 61 — momentum intact, not overbought\n• MACD bullish crossover on daily chart\n• FinBERT score: +0.88 (strong positive news flow)\n• GPU demand from AI sector hitting all-time highs\n\n**Risk Factors:**\n• High P/E ratio of 70x (premium valuation)\n• China export restrictions risk\n• Profit-taking after 120% YTD run\n\n**Recommendation**: Consider a staged entry — 50% position now, add on pullbacks to $840–$850 zone.",
  macd: "**MACD (Moving Average Convergence Divergence)** 📊\n\nMACD measures momentum using two EMAs:\n\n• **MACD Line** = EMA(12) - EMA(26)\n• **Signal Line** = EMA(9) of MACD Line\n• **Histogram** = MACD - Signal Line\n\n**Signals:**\n🟢 **Bullish Cross**: MACD crosses *above* Signal Line → potential buy\n🔴 **Bearish Cross**: MACD crosses *below* Signal Line → potential sell\n\n**StockAI Enhancement**: Our models combine MACD with RSI, volume, and sentiment to filter false signals. Standalone MACD gives ~60% accuracy; our ensemble improves this to **78–84%**.",
  tesla: "**Tesla (TSLA) Risk Analysis** ⚠️\n\nRisk Score: **68/100 (High)**\n\n📊 **Key Metrics:**\n• Volatility: 52% annualized (2.4x S&P500)\n• Beta: 1.82 vs market\n• Max Drawdown: -29.4% (52-week)\n• Sharpe Ratio: 0.62 (below 1.0)\n\n**Risk Drivers:**\n• CEO sentiment risk (social media volatility)\n• EV market saturation concerns\n• Margin pressure from price cuts\n• Regulatory risks across geographies\n\n**Recommendation**: If holding TSLA, ensure it's ≤10% of portfolio. Use stop-loss at $218 level.",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('nvidia') || lower.includes('nvda')) return AI_RESPONSES.nvidia;
  if (lower.includes('macd') || lower.includes('indicator') || lower.includes('explain')) return AI_RESPONSES.macd;
  if (lower.includes('tesla') || lower.includes('tsla') || lower.includes('risk')) return AI_RESPONSES.tesla;
  return AI_RESPONSES.default;
}

function formatMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-white mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.includes('**')) {
      const parts = line.split('**');
      return (
        <p key={i} className="text-gray-300 text-sm leading-relaxed">
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-white">{p}</strong> : p)}
        </p>
      );
    }
    if (line.startsWith('•')) {
      return <p key={i} className="text-gray-300 text-sm ml-2">• {line.slice(1)}</p>;
    }
    if (line.startsWith('🟢') || line.startsWith('🔴') || line.startsWith('📈') || line.startsWith('📊') || line.startsWith('⚠️')) {
      return <p key={i} className="text-gray-300 text-sm">{line}</p>;
    }
    if (line === '') return <br key={i} />;
    return <p key={i} className="text-gray-300 text-sm leading-relaxed">{line}</p>;
  });
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm **StockAI Assistant** 🤖\n\nI can help you with:\n• Stock predictions and analysis\n• Technical indicator explanations\n• Portfolio advice\n• Risk assessment\n• Investment strategies\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(content),
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fade-in">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-white">AI Investment Assistant</h1>
        <p className="text-gray-400 text-sm mt-1">Ask anything about stocks, predictions, indicators, and strategies</p>
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-cyan-400 to-purple-600' : 'bg-gradient-to-br from-gray-600 to-gray-700'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'assistant' ? 'bg-white/4 border border-white/8' : 'bg-[#00E5FF]/10 border border-[#00E5FF]/20'}`}>
                    <div className="space-y-0.5">
                      {formatMessage(msg.content)}
                    </div>
                    <p className="text-[10px] text-gray-600 mt-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-[#00E5FF]"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask me about any stock, indicator, or strategy..."
                className="cyber-input flex-1"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="neon-button p-3 rounded-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="hidden lg:flex w-56 flex-col gap-4">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Quick Ask
            </h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs text-gray-300 hover:text-[#00E5FF] p-2 rounded-lg hover:bg-[#00E5FF]/5 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Capabilities</h3>
            <div className="space-y-2.5">
              {[
                { icon: Brain, label: 'AI Predictions' },
                { icon: TrendingUp, label: 'Technical Analysis' },
                { icon: Shield, label: 'Risk Assessment' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs text-gray-400">
                  <c.icon className="w-3.5 h-3.5 text-[#00E5FF]" />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
