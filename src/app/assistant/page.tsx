'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, Language } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { VoiceControls } from '@/components/assistant/VoiceControls';
import { MarkdownView } from '@/components/assistant/MarkdownView';
import {
  Bot,
  User,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  X,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string | null;
  createdAt?: string;
}

interface Conversation {
  id: string;
  title: string;
  language: string;
  created_at: string;
}

const SUGGESTED_PROMPTS: Record<Language, string[]> = {
  bn: [
    'আলুর নাবী ধসা রোগ নিয়ন্ত্রণের সেরা উপায় কী?',
    'বোরো ধানের চারা রোপণের সঠিক সময় ও সেচ পদ্ধতি',
    'পশ্চিমবঙ্গ কৃষক বন্ধু প্রকল্পে আবেদনের নিয়ম কী?',
    'বেগুন গাছে ডগা ও ফল ছিদ্রকারী পোকার জৈব দমন',
  ],
  hi: [
    'आलू में पिछेती झुलसा रोग का जैविक उपचार क्या है?',
    'धान की फसल में यूरिया और डीएपी डालने का सही समय',
    'पीएम किसान सम्मान निधि की पात्रता और लाभ',
    'गेहूं की अच्छी पैदावार के लिए पहली सिंचाई कब करें?',
  ],
  en: [
    'How do I identify and treat Late Blight in potato crops?',
    'Recommended fertilizer N-P-K schedule for winter rice',
    'Government schemes available for West Bengal farmers',
    'Organic bio-pesticides for brinjal shoot and fruit borer',
  ],
};

export default function AssistantPage() {
  const { language } = useTranslation();
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Open sidebar by default on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Load conversations list for signed-in users
  useEffect(() => {
    if (!user) return;
    fetch('/api/assistant/conversations')
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) {
          setConversations(data.conversations);
        }
      })
      .catch((err) => console.warn('Could not load conversations:', err));
  }, [user]);

  // Load messages when selecting an existing conversation
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assistant/conversations?id=${convId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map((m: { id: string; role: 'user' | 'assistant'; content: string; image_url?: string | null; created_at?: string }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            imageUrl: m.image_url,
            createdAt: m.created_at,
          }))
        );
      }
    } catch (err) {
      console.warn('Error loading conversation messages:', err);
      toast.error('Could not load chat messages.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize new empty chat
  const handleNewChat = () => {
    setMessages([]);
    setAttachedImage(null);
    setInputText('');
    setActiveConversationId(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachedImage) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      imageUrl: attachedImage,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
          })),
          language,
          conversationId: activeConversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chat assistant failed');
      }

      if (data.conversationId && data.conversationId !== activeConversationId) {
        setActiveConversationId(data.conversationId);
        // Refresh conversations list so new conversation appears in the sidebar
        fetch('/api/assistant/conversations')
          .then((r) => r.json())
          .then((cData) => {
            if (cData.conversations) setConversations(cData.conversations);
          })
          .catch(() => {});
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error reaching assistant';
      toast.error(msg);
      // Append honest fallback error in chat
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content:
            language === 'bn'
              ? 'দুঃখিত, এআই সার্ভিসের সাথে যোগাযোগ করা সম্ভব হয়নি। অনুগ্রহ করে আপনার ইন্টারনেট বা সেটআপ পরীক্ষা করুন।'
              : language === 'hi'
              ? 'क्षमा करें, एआई सेवा से संपर्क नहीं हो सका। कृपया अपना इंटरनेट या सेवा स्थिति जांचें।'
              : 'I apologize, but I am unable to connect to the agronomy AI service right now. Please verify your connection or system configuration.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;

    try {
      const res = await fetch(`/api/assistant/conversations?id=${convId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversationId === convId) {
          handleNewChat();
        }
        toast.success('Conversation removed.');
      }
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  const currentSuggestions = SUGGESTED_PROMPTS[language] || SUGGESTED_PROMPTS.en;

  return (
    <div className="flex flex-col h-[calc(100dvh-115px)] sm:h-[calc(100dvh-130px)] lg:h-[calc(100vh-140px)] w-full text-left relative overflow-hidden">
      {/* Top Bar with Language Indicator & Actions */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-cream-200 gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Toggle history button for mobile/desktop */}
          {!isGuest && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 sm:p-2 rounded-xl border border-cream-200 bg-white hover:bg-cream-100 text-brand-dark/70 transition-colors shrink-0"
              aria-label="Toggle history"
              title="Chat History"
            >
              <MessageSquare className="w-4 h-4 text-brand-leaf" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-forest flex items-center justify-center text-white shadow-xs shrink-0">
              <Bot className="w-4 h-4 text-brand-mint" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-extrabold text-brand-forest leading-none truncate">
                AI Agronomy Assistant
              </h1>
              <span className="text-[10px] text-brand-dark/60 font-medium truncate block">
                ICAR & Bengal Agro-Climatic Data
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs px-2.5 py-1.5 sm:px-3 sm:py-2"
          >
            <span className="hidden xs:inline">New Chat</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex flex-1 min-h-0 pt-2.5 sm:pt-3 gap-3 lg:gap-4 overflow-hidden">
        {/* Desktop Sidebar (Logged in users, desktop screen) */}
        {!isGuest && isSidebarOpen && (
          <aside className="hidden lg:flex w-64 border-r border-cream-200 pr-3 flex-col space-y-2 bg-cream-50/50 rounded-2xl p-2 shrink-0">
            <span className="text-xs font-bold text-brand-forest uppercase tracking-wider px-2 py-1">
              Chat History
            </span>
            <div className="flex-1 overflow-y-auto space-y-1">
              {conversations.length === 0 ? (
                <p className="text-xs text-brand-dark/50 p-2 italic">
                  No previous conversations saved.
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-brand-forest text-white'
                        : 'bg-white text-brand-dark hover:bg-cream-100 border border-cream-200'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{conv.title}</span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="p-1 rounded opacity-60 hover:opacity-100 hover:text-red-500"
                      aria-label="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Mobile Slide-over Drawer for Chat History */}
        {!isGuest && isSidebarOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="lg:hidden fixed inset-0 z-50 bg-brand-dark/50 backdrop-blur-xs flex flex-col justify-end"
          >
            <div
              className="fixed inset-0"
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
            />
            <div className="relative bg-cream-50 rounded-t-3xl border-t border-cream-200 p-4 shadow-2xl z-10 max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-leaf" />
                  <span className="text-sm font-bold text-brand-dark">Previous Chats</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded-lg text-brand-dark/60 hover:text-brand-dark hover:bg-cream-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 py-3">
                {conversations.length === 0 ? (
                  <p className="text-xs text-brand-dark/50 p-4 text-center italic">
                    No previous conversations saved yet.
                  </p>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        handleSelectConversation(conv.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                        activeConversationId === conv.id
                          ? 'bg-brand-forest text-white'
                          : 'bg-white text-brand-dark hover:bg-cream-100 border border-cream-200'
                      }`}
                    >
                      <span className="truncate max-w-[200px]">{conv.title}</span>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className="p-1.5 rounded opacity-60 hover:opacity-100 hover:text-red-500"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleNewChat();
                  setIsSidebarOpen(false);
                }}
                className="w-full mt-2"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Start New Chat
              </Button>
            </div>
          </div>
        )}

        {/* Chat Messages Stream Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-cream-200/90 shadow-xs overflow-hidden">
          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-brand-forest/10 border border-brand-forest/20 flex items-center justify-center text-brand-forest">
                  <Bot className="w-7 h-7 text-brand-leaf" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-brand-dark">
                    How can I assist your farm today?
                  </h3>
                  <p className="text-xs text-brand-dark/70 leading-relaxed">
                    Ask any question about crop diseases, pest remedies, fertilizer schedules, or government schemes in your preferred language.
                  </p>
                </div>

                {/* Suggested Prompt Chips */}
                <div className="w-full space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-brand-forest uppercase tracking-wider block">
                    Suggested Questions
                  </span>
                  <div className="flex flex-col gap-2">
                    {currentSuggestions.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-3 text-left rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-200 text-xs font-semibold text-brand-dark/85 transition-colors flex items-center justify-between group"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-brand-leaf opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4 text-brand-mint" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-forest text-white shadow-xs rounded-tr-xs'
                        : 'bg-cream-50 text-brand-dark border border-cream-200 rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Attached image if any */}
                    {msg.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden max-w-xs border border-white/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.imageUrl}
                          alt="Attached leaf"
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    )}

                    {msg.role === 'assistant' ? (
                      <MarkdownView content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-line break-words">{msg.content}</div>
                    )}

                    {/* Copy and Audio controls for assistant replies */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center justify-end gap-2 pt-2 mt-2 border-t border-cream-200/80 text-[11px] text-brand-dark/60">
                        <button
                          onClick={() => copyToClipboard(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-brand-dark transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <VoiceControls
                          language={language}
                          onSpeechInput={() => {}}
                          textToSpeak={msg.content}
                        />
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-cream-200 text-brand-forest flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-brand-forest text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-brand-mint" />
                </div>
                <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-leaf animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-leaf animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-brand-leaf animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached image preview pill before sending */}
          {attachedImage && (
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-cream-100 border-t border-cream-200 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage}
                  alt="Attachment preview"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover border border-cream-300"
                />
                <span className="text-xs font-semibold text-brand-dark">Leaf Attached</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 rounded-lg text-brand-dark/60 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-2 sm:p-3.5 border-t border-cream-200 bg-white/95 backdrop-blur-md shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {/* Image upload trigger */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-cream-300 bg-cream-50 hover:bg-cream-100 text-brand-dark/70 hover:text-brand-forest transition-colors shrink-0 flex items-center justify-center"
                title="Attach Crop Image"
              >
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Voice Input (Speech-to-Text) */}
              <div className="shrink-0">
                <VoiceControls
                  language={language}
                  onSpeechInput={(transcript) => {
                    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
                  }}
                />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'ফসল সম্পর্কে জিজ্ঞাসা করুন...'
                    : language === 'hi'
                    ? 'फसल के बारे में पूछें...'
                    : 'Ask crop health, weather...'
                }
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-brand-dark placeholder:text-brand-dark/40 focus:outline-none focus:ring-2 focus:ring-brand-forest/20 focus:border-brand-forest focus:bg-white min-h-[40px] sm:min-h-[44px]"
                disabled={isLoading}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || (!inputText.trim() && !attachedImage)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-forest hover:bg-brand-leaf disabled:bg-cream-300 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-colors shadow-xs"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
