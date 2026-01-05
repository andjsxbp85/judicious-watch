import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Domain } from '@/lib/mockData';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface AIChatbotProps {
  domain: Domain;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ domain }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: `Halo! Saya AI Assistant yang menganalisis domain **${domain.domain}**. Silakan tanyakan tentang alasan klasifikasi, kata kunci yang terdeteksi, atau analisis konten lainnya.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('alasan') || q.includes('kenapa') || q.includes('mengapa')) {
      return domain.aiReasoning;
    }
    
    if (q.includes('kata kunci') || q.includes('keyword')) {
      return `Kata kunci yang terdeteksi pada website ini:\n\n${domain.keywords.map(k => `• **${k}**`).join('\n')}\n\nKata kunci ini digunakan dalam analisis untuk menentukan klasifikasi domain.`;
    }
    
    if (q.includes('confidence') || q.includes('skor') || q.includes('akurasi')) {
      return `Confidence score untuk domain ini adalah **${domain.confidenceScore}%**. ${
        domain.confidenceScore >= 90
          ? 'Skor ini sangat tinggi, menunjukkan AI sangat yakin dengan klasifikasinya.'
          : domain.confidenceScore >= 70
          ? 'Skor ini cukup tinggi, namun masih perlu verifikasi manual untuk kepastian.'
          : 'Skor ini menengah, sangat disarankan untuk melakukan verifikasi manual.'
      }`;
    }
    
    if (q.includes('konten') || q.includes('isi') || q.includes('content')) {
      return `Berikut ringkasan konten yang diekstrak:\n\n"${domain.extractedContent.substring(0, 200)}..."\n\nKonten ini dianalisis untuk mendeteksi pola dan kata kunci yang terkait dengan perjudian online.`;
    }
    
    if (q.includes('status') || q.includes('klasifikasi')) {
      return `Domain ini diklasifikasikan sebagai **${domain.status === 'judol' ? 'Judi Online' : 'Non Judi Online'}** dengan confidence score ${domain.confidenceScore}%.`;
    }
    
    return `Berdasarkan analisis saya terhadap **${domain.domain}**:\n\n${domain.aiReasoning}\n\nApakah ada hal spesifik lain yang ingin Anda ketahui?`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: generateAIResponse(input),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'Apa hukuman bagi pelaku judi online di Indonesia?',
    'Bagaimana regulasi pemblokiran situs judi online?',
    'Apa dasar hukum UU ITE terkait judi online?',
  ];

  return (
    <div id="ai-chatbot-container" className="flex flex-col h-full">
      {/* Chat Header */}
      <div id="ai-chatbot-header" className="flex items-center gap-3 p-4 border-b border-border">
        <div id="ai-chatbot-icon" className="p-2 rounded-full bg-primary/10">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 id="ai-chatbot-title" className="font-semibold text-foreground">AI Assistant</h3>
          <p id="ai-chatbot-subtitle" className="text-xs text-muted-foreground">Analisis Domain</p>
        </div>
      </div>

      {/* Messages */}
      <div id="ai-chatbot-messages" className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            id={`chat-message-${message.id}`}
            className={`flex items-start gap-2 animate-slide-up ${
              message.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              id={`chat-avatar-${message.id}`}
              className={`p-2 rounded-full shrink-0 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              id={`chat-bubble-${message.id}`}
              className={
                message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
              }
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content.split('**').map((part, i) => 
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div id="ai-typing-indicator" className="flex items-start gap-2">
            <div className="p-2 rounded-full bg-muted shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="chat-bubble-ai">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft delay-75" />
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse-soft delay-150" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div id="quick-questions-container" className="px-4 pb-2">
          <p id="quick-questions-label" className="text-xs text-muted-foreground mb-2">Pertanyaan cepat:</p>
          <div id="quick-questions-list" className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                id={`quick-question-${i}`}
                onClick={() => setInput(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div id="ai-chatbot-input-container" className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            id="ai-chatbot-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tanyakan tentang domain ini..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            id="ai-chatbot-send-btn"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;
