import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { assistantApi } from '../../shared/api';
import { ChatMessage } from '../../shared/types';
import { Button, Input, Card } from '../../shared/components/ui';
import { Bot, Send, User, Sparkles, Info, ShieldCheck } from 'lucide-react';

export const AssistantPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Xin chào! Tôi là Trợ lý AI SmartRent. Tôi có thể hỗ trợ giải đáp các thắc mắc về hợp đồng thuê, hạn thanh toán tiền phòng và tình trạng xử lý các yêu cầu sửa chữa thuộc tài khoản của bạn.',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askMutation = useMutation({
    mutationFn: (q: string) => assistantApi.ask({ question: q }),
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: data.answer,
        requiresMoreInfo: data.requires_more_information,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (err: any) => {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text:
          err.status === 502
            ? 'Trợ lý AI hiện đang tạm ngưng phục vụ hoặc gặp sự cố kết nối với nhà cung cấp. Vui lòng thử lại sau.'
            : err.message || 'Không thể lấy phản hồi từ trợ lý AI. Vui lòng thử lại.',
        isError: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const q = textToSend || question;
    if (!q.trim() || askMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) {
      setQuestion('');
    }
    askMutation.mutate(q.trim());
  };

  const sampleQuestions = [
    'Hạn thanh toán tiền phòng kỳ này của tôi là khi nào?',
    'Hợp đồng thuê của tôi còn hiệu lực đến ngày bao nhiêu?',
    'Tình trạng yêu cầu sửa chữa gần nhất của tôi ra sao?',
    'Tổng tiền thuê nhà tôi đã thanh toán là bao nhiêu?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-container bg-primary-soft text-primary flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Trợ lý AI SmartRent</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                Chế độ chỉ đọc
              </span>
            </h1>
            <p className="text-xs text-ink-secondary">
              Được bảo vệ bởi ranh giới phân quyền máy chủ • Dữ liệu trả lời trực tiếp từ tài khoản của bạn
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-muted">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Bảo mật ngữ cảnh</span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <Card className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface/70">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-ink text-white'
                    : msg.isError
                    ? 'bg-status-error-soft text-status-error'
                    : 'bg-primary-soft text-primary'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-container p-3.5 sm:p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-primary text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-status-error-soft text-status-error border border-status-error-border rounded-tl-none'
                    : 'bg-surface border border-border text-ink rounded-tl-none shadow-soft'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {msg.requiresMoreInfo && (
                  <div className="mt-2.5 pt-2 border-t border-border flex items-center gap-1.5 text-xs text-accent">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Trợ lý cần thêm thông tin chi tiết để trả lời trọn vẹn hơn.</span>
                  </div>
                )}

                <div
                  className={`mt-1.5 text-[10px] text-right ${
                    isUser ? 'text-white/70' : 'text-ink-muted'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {askMutation.isPending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-surface border border-border rounded-container rounded-tl-none p-3.5 text-xs text-ink-secondary flex items-center gap-2 shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
              <span>Trợ lý AI đang tra cứu dữ liệu thuê trọ của bạn...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Suggested Questions Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-ink-muted shrink-0 text-[11px] font-semibold">Gợi ý câu hỏi:</span>
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(sq)}
            disabled={askMutation.isPending}
            className="px-2.5 py-1 bg-surface border border-border hover:border-primary/40 hover:bg-primary-soft/20 text-ink-secondary hover:text-ink rounded-full whitespace-nowrap transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <Input
          placeholder="Nhập câu hỏi cần hỗ trợ..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={askMutation.isPending}
          className="h-12"
          autoFocus
        />
        <Button
          type="submit"
          variant="primary"
          className="h-12 px-5 shrink-0"
          disabled={!question.trim() || askMutation.isPending}
          isLoading={askMutation.isPending}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Gửi
        </Button>
      </form>

      {/* Safety notice */}
      <p className="text-[11px] text-center text-ink-muted">
        AI Assistant chỉ đọc dữ liệu thuê trọ thuộc quyền truy cập của bạn và không có quyền thay đổi thông tin hợp đồng hay tài chính.
      </p>
    </div>
  );
};
