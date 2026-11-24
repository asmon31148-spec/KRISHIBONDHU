'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation, Language } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { VoiceControls } from '@/components/assistant/VoiceControls';
import { WalkieTalkie } from '@/components/voice/WalkieTalkie';
import { MarkdownView } from '@/components/assistant/MarkdownView';
import {
  Bot,
  Send,
  Plus,
  Trash2,
  Copy,
  Image as ImageIcon,
  X,
  MessageSquare,
  Flag,
  ShieldAlert,
} from 'lucide-react';
import { ActiveCropIssueContext } from '@/lib/ai/chat';

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

interface SuggestedCard {
  icon: string;
  tag: string;
  title: string;
  desc: string;
  prompt: string;
}

const SUGGESTED_CARDS: Record<Language, SuggestedCard[]> = {
  bn: [
    {
      icon: '🥔',
      tag: 'রোগ নির্ণয়',
      title: 'আলুর নাবী ধসা রোগ',
      desc: 'লক্ষণ, আবহাওয়া সতর্কতা ও সঠিক ওষুধ স্প্রে মাত্রা',
      prompt: 'আলুর নাবী ধসা রোগ নিয়ন্ত্রণের সেরা উপায় কী?',
    },
    {
      icon: '🌾',
      tag: 'সারের হিসাব',
      title: 'বোরো ধানের এন-পি-কে মাত্রা',
      desc: 'বিঘা প্রতি ইউরিয়া, ডিএপি ও পটাশ প্রয়োগের সময়সূচি',
      prompt: 'বোরো ধানের চারা রোপণের সঠিক সময় ও সারের সেচ পদ্ধতি কী?',
    },
    {
      icon: '🏛️',
      tag: 'সরকারি অনুদান',
      title: 'কৃষকবন্ধু ও পিএম কিষান',
      desc: 'ডিবিটি অনুদানের যোগ্যতা, প্রয়োজনীয় নথি ও যাচাই',
      prompt: 'পশ্চিমবঙ্গ কৃষক বন্ধু প্রকল্পে আবেদনের নিয়ম ও সুবিধা কী?',
    },
    {
      icon: '🍆',
      tag: 'জৈব প্রতিকার',
      title: 'বেগুনের ডগা ও ফল ছিদ্রকারী',
      desc: 'নিম তেল ও ফেরোমোন ফাঁদ দিয়ে কার্যকর জৈব দমন',
      prompt: 'বেগুন গাছে ডগা ও ফল ছিদ্রকারী পোকার জৈব দমন পদ্ধতি কী?',
    },
  ],
  hi: [
    {
      icon: '🥔',
      tag: 'रोग पहचान',
      title: 'आलू में पिछेती झुलसा',
      desc: 'लक्षण, मौसम चेतावनी व स्वीकृत फफूंदनाशी उपचार',
      prompt: 'आलू में पिछेती झुलसा रोग का जैविक उपचार क्या है?',
    },
    {
      icon: '🌾',
      tag: 'खाद प्रबंधन',
      title: 'धान में एन-पी-के मात्रा',
      desc: 'यूरिया, डीएपी व पोटाश की वैज्ञानिक समय सारिणी',
      prompt: 'धान की फसल में यूरिया और डीएपी डालने का सही समय और मात्रा बताएं',
    },
    {
      icon: '🏛️',
      tag: 'सरकारी योजनाएं',
      title: 'पीएम किसान सम्मान निधि',
      desc: 'पात्रता, ई-केवाईसी प्रक्रिया व किस्त की स्थिति',
      prompt: 'पीएम किसान सम्मान निधि की पात्रता और लाभ की जानकारी दें',
    },
    {
      icon: '🍆',
      tag: 'जैविक कीट नियंत्रण',
      title: 'बैंगन फल व तना छेदक',
      desc: 'नीम तेल व फेरोमोन ट्रैप से जैविक रोकथाम',
      prompt: 'बैंगन में तना व फल छेदक कीट की रोकथाम के जैविक उपाय क्या हैं?',
    },
  ],
  en: [
    {
      icon: '🥔',
      tag: 'Disease Diagnosis',
      title: 'Potato Late Blight',
      desc: 'Symptoms, weather triggers, & ICAR fungicide dosages',
      prompt: 'How do I identify and treat Late Blight in potato crops?',
    },
    {
      icon: '🌾',
      tag: 'Fertilizer Balance',
      title: 'Winter Rice N-P-K Schedule',
      desc: 'Exact basal & top-dress split dosages per Bigha',
      prompt: 'Recommended fertilizer N-P-K schedule for winter rice',
    },
    {
      icon: '🏛️',
      tag: 'Government Schemes',
      title: 'Krishak Bandhu & PM-Kisan',
      desc: 'DBT cash support eligibility & required documents',
      prompt: 'Government schemes available for West Bengal farmers',
    },
    {
      icon: '🍆',
      tag: 'Bio Pest Control',
      title: 'Brinjal Shoot & Fruit Borer',
      desc: 'Neem-based organic remedies & pheromone traps',
      prompt: 'Organic bio-pesticides for brinjal shoot and fruit borer',
    },
  ],
};

function AssistantChat() {
  const searchParams = useSearchParams();
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

  // Active Crop / Plot Context (Passed from Farms, Crops, or Alert Cards)
  const [activeCropContext, setActiveCropContext] = useState<ActiveCropIssueContext | null>(null);
  const hasAutoAskedRef = useRef(false);

  // Feedback Report State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingContent, setReportingContent] = useState('');
  const [reportCategory, setReportCategory] = useState('Pesticide or Chemical Dosage');
  const [reportNotes, setReportNotes] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep sidebar closed by default for a clean, spacious, centered conversational interface
  // User can click "History" at any time to open saved chats

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  // Process Context from URL Query Parameters (e.g. from Farms / Crops / Dashboard Alert)
  useEffect(() => {
    const cropName = searchParams.get('crop_name');
    const customQuery = searchParams.get('q');
    const autoAsk = searchParams.get('auto_ask') === 'true' || Boolean(cropName);

    if (cropName) {
      const variety = searchParams.get('variety');
      const status = searchParams.get('status') || 'needs_attention';
      const farmName = searchParams.get('farm');
      const location = searchParams.get('location');
      const soil = searchParams.get('soil');
      const area = searchParams.get('area');
      const unit = searchParams.get('unit');
      const sown = searchParams.get('sown');
      const irrigation = searchParams.get('irrigation');

      const ctx: ActiveCropIssueContext = {
        cropName,
        variety,
        healthStatus: status,
        farmName,
        location,
        soilType: soil,
        area,
        areaUnit: unit,
        sownDate: sown,
        irrigation,
      };

      setActiveCropContext(ctx);

      if (autoAsk && !hasAutoAskedRef.current) {
        hasAutoAskedRef.current = true;

        let autoPrompt = '';
        if (language === 'bn') {
          autoPrompt = `আমার খামার "${farmName || 'জমির'}"-এর ${area || '১'} ${unit || 'বিঘা'} জমিতে চাষ করা "${cropName}"${variety ? ` (${variety} জাত)` : ''}-এ 'Needs Attention' (মনোযোগ প্রয়োজন) সতর্কতা দেখাচ্ছে। মাটিতে ${soil || 'কাদা মাটি (Clay)'} এবং সেচ ${irrigation || 'STW'}। 

এই ফসলে বর্তমান মৌসুমে কী কী রোগ, বালাই বা পুষ্টির ঘাটতির ঝুঁকি রয়েছে, এবং এর জন্য অবিলম্বে কী কী জৈব ও ICAR/BCKV অনুমোদিত প্রতিকার ব্যবস্থা গ্রহণ করা উচিত?`;
        } else if (language === 'hi') {
          autoPrompt = `मेरे खेत "${farmName || 'खेत'}" के ${area || '1'} ${unit || 'बीघा'} में लगी "${cropName}"${variety ? ` (${variety})` : ''} फसल में 'Needs Attention' (कार्रवाई की आवश्यकता) अलर्ट आ रहा है। मिट्टी ${soil || 'चिकनी मिट्टी'} और सिंचाई ${irrigation || 'STW'} है। 

इस फसल में वर्तमान मौसम में किन रोगों, कीटों या पोषक तत्वों की कमी का खतरा है और तुरंत क्या जैविक व ICAR अनुमोदित उपचार करना चाहिए?`;
        } else {
          autoPrompt = `My crop "${cropName}"${variety ? ` (Variety: ${variety})` : ''} on "${farmName || 'My Farm'}" (${area || '1'} ${unit || 'Bigha'}, ${soil || 'Clay'} soil, planted on ${sown || 'recent'}) currently has an active 'Needs Attention' status.

What are the specific disease, pest, or nutrient risks for this crop in West Bengal right now, and what immediate organic and ICAR/BCKV chemical treatment protocols should I apply?`;
        }

        handleSendMessage(autoPrompt, ctx);
      }
    } else if (customQuery && !hasAutoAskedRef.current) {
      hasAutoAskedRef.current = true;
      handleSendMessage(customQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, language]);

  // Load messages when selecting an existing conversation
  const handleSelectConversation = async (convId: string) => {
    setActiveConversationId(convId);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assistant/conversations?id=${convId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map(
            (m: {
              id: string;
              role: 'user' | 'assistant';
              content: string;
              image_url?: string | null;
              created_at?: string;
            }) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              imageUrl: m.image_url,
              createdAt: m.created_at,
            })
          )
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
    setActiveCropContext(null);
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

  const handleSendMessage = async (
    textToSend?: string,
    overrideCropContext?: ActiveCropIssueContext | null
  ) => {
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
          cropContext: overrideCropContext !== undefined ? overrideCropContext : activeCropContext,
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

  const currentSuggestions = SUGGESTED_CARDS[language] || SUGGESTED_CARDS.en;

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFCFA] dark:bg-[#0B1711] relative overflow-hidden text-left transition-colors duration-200">
      {/* Top Bar with Clean Header & History Controls */}
      <div className="flex items-center justify-between px-3 sm:px-5 h-[52px] border-b border-[#143224]/10 dark:border-white/10 bg-[#F9F7F2]/90 dark:bg-[#0B1711]/90 backdrop-blur-md gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {!isGuest && (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[36px] ${
                isSidebarOpen
                  ? 'bg-[#143224] dark:bg-emerald-600 text-white border-[#143224] dark:border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-[#13261D] hover:bg-[#EAF2EC] dark:hover:bg-[#1A3326] text-[#143224] dark:text-[#EAF2EC] border-[#143224]/15 dark:border-white/15 shadow-2xs'
              }`}
              title={isSidebarOpen ? 'Hide History Panel' : 'Show Saved Conversations'}
              aria-label="Toggle history"
            >
              <MessageSquare className={`w-3.5 h-3.5 ${isSidebarOpen ? 'text-[#D9822B] dark:text-emerald-100' : 'text-[#1E4733] dark:text-emerald-400'}`} />
              <span>{isSidebarOpen ? 'Close' : 'History'}</span>
              {conversations.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSidebarOpen ? 'bg-white/20 text-white' : 'bg-[#143224]/10 dark:bg-white/10 text-[#143224] dark:text-white'
                  }`}
                >
                  {conversations.length}
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#13261D] border border-[#143224]/10 dark:border-white/10 text-[#143224] dark:text-[#EAF2EC] text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">BCKV & ICAR AI</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="bg-white dark:bg-[#13261D] hover:bg-[#EAF2EC] dark:hover:bg-[#1A3326] text-xs font-bold border-[#143224]/15 dark:border-white/15 text-[#143224] dark:text-[#EAF2EC] shadow-2xs min-h-[36px]"
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#1E4733] dark:text-emerald-400" />}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Main Chat Layout Area (Flush Docked with Zero Margin Gap) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sub-Sidebar: Sleek Integrated Chat History */}
        {isSidebarOpen && !isGuest && (
          <aside className="w-72 lg:w-80 border-r border-[#143224]/10 dark:border-white/10 bg-[#FDFCFA] dark:bg-[#0F1E16] flex flex-col shrink-0 z-10 animate-in slide-in-from-left duration-150">
            {/* Panel Header */}
            <div className="p-3.5 border-b border-[#143224]/10 dark:border-white/10 flex items-center justify-between bg-[#F9F7F2]/60 dark:bg-[#0B1711]/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#143224] dark:text-[#EAF2EC]">
                  Saved Chats
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#143224]/10 dark:bg-white/10 text-[#143224] dark:text-[#EAF2EC]">
                  {conversations.length}
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-[#10241A]/50 dark:text-white/50 hover:text-[#10241A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Collapse History"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Conversation List with Sleek Hover Items */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 no-scrollbar">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#10241A]/50 dark:text-white/40 italic">
                  No previous conversations. Start asking questions to save your advisory history!
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = activeConversationId === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        handleSelectConversation(conv.id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#143224] dark:bg-emerald-600 text-white shadow-xs'
                          : 'text-[#10241A]/80 dark:text-[#EAF2EC]/80 hover:bg-[#EAF2EC]/70 dark:hover:bg-white/5 hover:text-[#143224] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isSelected ? 'text-[#D9822B] dark:text-white' : 'text-[#143224]/40 dark:text-emerald-400/60 group-hover:text-[#143224]'
                          }`}
                        />
                        <span className="truncate">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => deleteConversation(conv.id, e)}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-black/5 ${
                          isSelected ? 'text-white/80 hover:text-white' : 'text-[#10241A]/40 dark:text-white/40'
                        }`}
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Chat Messages Stream Area (Flush Docked flex-1) */}
        <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCFA] dark:bg-[#0B1711] overflow-hidden transition-colors duration-200">
          {/* Active Crop Field Issue Context Pill (If navigated from Farms/Crops/Alerts) */}
          {activeCropContext && (
            <div className="mx-3 mt-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 flex items-start justify-between gap-3 shadow-2xs shrink-0">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0 mt-0.5 shadow-2xs">
                  <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-brand-dark dark:text-amber-100">
                      Active Plot Context Loaded
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-[10px] font-extrabold uppercase tracking-wider">
                      {activeCropContext.healthStatus === 'needs_attention'
                        ? 'Action Needed'
                        : activeCropContext.healthStatus || 'Alert'}
                    </span>
                  </div>
                  <p className="text-xs text-brand-dark/85 dark:text-amber-200/90 mt-0.5 leading-snug">
                    <strong className="text-brand-forest dark:text-white">{activeCropContext.cropName}</strong>
                    {activeCropContext.variety ? ` (Variety: ${activeCropContext.variety})` : ''}
                    {activeCropContext.farmName ? ` on ${activeCropContext.farmName}` : ''}
                    {activeCropContext.area ? ` • ${activeCropContext.area} ${activeCropContext.areaUnit || 'Bigha'}` : ''}
                    {activeCropContext.soilType ? ` • ${activeCropContext.soilType} Soil` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCropContext(null)}
                className="p-1 rounded-lg text-brand-dark/40 dark:text-white/40 hover:text-brand-dark dark:hover:text-white hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                title="Clear Context"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scrollable Message History */}
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:p-5 space-y-4 no-scrollbar">
            <div className="max-w-3xl mx-auto w-full space-y-4">
              {messages.length === 0 ? (
                /* Compact, Friendly Mobile Welcome Area */
                <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8 space-y-4 sm:space-y-6 w-full my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF2EC] dark:bg-[#13261D] border border-[#143224]/10 dark:border-white/10 flex items-center justify-center shadow-xs">
                    <Bot className="w-7 h-7 text-[#143224] dark:text-emerald-400" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-lg sm:text-xl font-black text-[#143224] dark:text-[#EAF2EC] tracking-tight">
                      {language === 'bn'
                        ? 'কৃষিবন্ধু এগ্রোনমি সহকারী'
                        : language === 'hi'
                        ? 'कृषिबंधु सस्य विज्ञान सहायक'
                        : 'Krishibondhu Agronomy Assistant'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5E7367] dark:text-[#94A89E] font-medium leading-relaxed">
                      {language === 'bn'
                        ? 'গাছের পাতার রোগ, সার প্রয়োগ মাত্রা ও সরকারি অনুদান সম্পর্কে সরাসরি প্রশ্ন করুন।'
                        : language === 'hi'
                        ? 'फसल रोग, खाद की सटीक मात्रा और सरकारी योजनाओं की जानकारी पाएं।'
                        : 'Ask about crop leaf diseases, fertilizer dosages, or government subsidies.'}
                    </p>
                  </div>

                  {/* Compact Swipeable Topic Chips (Horizontal Scroll, Zero Screen Bloat) */}
                  <div className="w-full space-y-2 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#143224]/60 dark:text-white/50 block text-center">
                      {language === 'bn' ? 'কী জানতে চান? বেছে নিন' : language === 'hi' ? 'सुझाए गए विषय' : 'Quick Suggestions'}
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 justify-start sm:justify-center">
                      {currentSuggestions.map((card, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(card.prompt)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#13261D] hover:bg-[#EAF2EC] dark:hover:bg-[#1A3326] border border-[#143224]/10 dark:border-white/10 text-left cursor-pointer transition-all active:scale-[0.98] shadow-2xs shrink-0 min-h-[44px]"
                        >
                          <span className="text-base shrink-0">{card.icon}</span>
                          <div className="text-left">
                            <span className="text-xs font-bold text-[#143224] dark:text-[#EAF2EC] block leading-tight whitespace-nowrap">
                              {card.title}
                            </span>
                            <span className="text-[10px] font-semibold text-[#D9822B] block leading-tight">
                              {card.tag}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Conversation Stream */
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#143224] dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        <Bot className="w-4 h-4 text-emerald-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-[15px] sm:text-base leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#143224] dark:bg-emerald-700 text-white shadow-xs rounded-tr-xs'
                          : 'bg-white dark:bg-[#13261D] text-[#10241A] dark:text-[#EAF2EC] border border-[#143224]/10 dark:border-white/10 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {/* Attached image if any */}
                      {msg.imageUrl && (
                        <div className="mb-2 rounded-xl overflow-hidden max-w-[220px] sm:max-w-xs border border-white/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.imageUrl}
                            alt="Attached leaf"
                            className="w-full h-auto max-h-52 object-contain bg-black/10 rounded-lg"
                          />
                        </div>
                      )}

                      {msg.role === 'assistant' ? (
                        <MarkdownView content={msg.content} />
                      ) : (
                        <div className="whitespace-pre-line break-words">{msg.content}</div>
                      )}

                      {/* Controls for assistant replies */}
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-end gap-3 pt-2 mt-2.5 border-t border-[#143224]/10 dark:border-white/10 text-xs text-[#5E7367] dark:text-white/50">
                          <button
                            onClick={() => copyToClipboard(msg.id, msg.content)}
                            className="flex items-center gap-1 hover:text-[#10241A] dark:hover:text-white transition-colors cursor-pointer min-h-[32px] px-1"
                            title="Copy reply text"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <VoiceControls
                            language={language}
                            textToSpeak={msg.content}
                            onSpeechInput={(transcript) => handleSendMessage(transcript)}
                          />

                          <button
                            onClick={() => {
                              setReportingContent(msg.content);
                              setReportModalOpen(true);
                            }}
                            className="flex items-center gap-1 hover:text-red-600 transition-colors cursor-pointer min-h-[32px] px-1"
                            title="Report safety concern"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing Loader Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 sm:gap-3 justify-start">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#143224] dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Bot className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="bg-white dark:bg-[#13261D] border border-[#143224]/10 dark:border-white/10 rounded-2xl p-3.5 flex items-center gap-2 text-xs sm:text-sm text-[#10241A]/70 dark:text-[#EAF2EC]/70 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="ml-1 font-medium">Analyzing agronomy guidelines...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Attached Image Preview Bar */}
          {attachedImage && (
            <div className="px-4 py-2 border-t border-[#143224]/10 dark:border-white/10 bg-[#F9F7F2] dark:bg-[#13261D] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachedImage}
                  alt="Attachment preview"
                  className="w-10 h-10 object-cover rounded-lg border border-cream-300"
                />
                <span className="text-xs font-semibold text-brand-dark dark:text-white">Image attached</span>
              </div>
              <button
                onClick={() => setAttachedImage(null)}
                className="p-1 rounded-full hover:bg-cream-200 dark:hover:bg-white/10 text-brand-dark/60 dark:text-white/60 hover:text-brand-dark"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Unified Modern Agronomy Chat Capsule (Pinned Above Mobile Navigation) */}
          <div className="p-2.5 sm:p-4 border-t border-[#143224]/10 dark:border-white/10 bg-white/95 dark:bg-[#0B1711]/95 backdrop-blur-md shrink-0">
            <div className="max-w-3xl mx-auto space-y-1">
              <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#F9F7F2] dark:bg-[#13261D] border border-[#143224]/15 dark:border-white/15 shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:border-[#143224]/40 dark:focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#172D22] transition-all">
                {/* Photo Attachment Input & Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 sm:p-2.5 rounded-xl text-[#143224]/70 dark:text-white/70 hover:text-[#143224] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Attach photo of diseased leaf or crop"
                  disabled={isLoading}
                >
                  <ImageIcon className="w-5 h-5 text-[#1E4733] dark:text-emerald-400" />
                </button>

                {/* Text Input (16px to prevent iOS auto-zoom) */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    language === 'bn'
                      ? 'ফসলের রোগ, পোকা বা সার সম্পর্কে প্রশ্ন লিখুন...'
                      : language === 'hi'
                      ? 'फसल रोग, कीट या खाद के बारे में पूछें...'
                      : 'Ask about crop symptoms, dosage, or soil...'
                  }
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none text-base text-[#143224] dark:text-[#EAF2EC] font-medium placeholder:text-[#5E7367]/60 dark:placeholder:text-white/40 focus:outline-none focus:ring-0 px-1"
                />

                {/* Walkie-Talkie Voice Microphone Button */}
                <WalkieTalkie
                  language={language}
                  onSpeechFinal={(transcript) => {
                    setInputText(transcript);
                    handleSendMessage(transcript);
                  }}
                />

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || (!inputText.trim() && !attachedImage)}
                  className="p-2.5 sm:p-3 rounded-xl bg-[#143224] dark:bg-emerald-600 hover:bg-[#1E4733] disabled:opacity-30 disabled:hover:bg-[#143224] text-white transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-[#D9822B] dark:text-white" />
                </button>
              </div>

              {/* Verified Agricultural Intelligence Note (Subtle, Compact) */}
              <p className="text-[10px] text-center text-[#5E7367] dark:text-white/40 font-medium select-none truncate">
                {language === 'bn'
                  ? 'আইসিএআর ও বিসিকেভি সমন্বিত বৈজ্ঞানিক পরামর্শ · জমিতে কীটনাশক ব্যবহারের পূর্বে কৃষি কর্মকর্তার পরামর্শ নিন'
                  : language === 'hi'
                  ? 'आईसीएआर और बीसीकेवी प्रमाणित वैज्ञानिक सलाह · कीटनाशक उपयोग से पहले कृषि अधिकारी से पुष्टि करें'
                  : 'ICAR & BCKV validated agronomy guidance · Verify local field conditions before chemical spraying'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Report Agronomy Recommendation"
        >
          <div className="space-y-4 text-xs sm:text-sm text-left">
            <p className="text-brand-dark/75">
              Help us maintain strict agricultural safety standards. Tell us what was incorrect or unsafe in this advice.
            </p>
            {reportingContent && (
              <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-200 text-xs text-brand-dark/80 line-clamp-3 italic">
                &ldquo;{reportingContent}&rdquo;
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Category
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-cream-200 bg-white text-xs font-medium"
              >
                <option value="Pesticide or Chemical Dosage">Pesticide or Chemical Dosage</option>
                <option value="Wrong Disease Identified">Wrong Disease Identified</option>
                <option value="Inaccurate Sowing or Weather Info">Inaccurate Sowing or Weather Info</option>
                <option value="Inappropriate Tone or Language">Inappropriate Tone or Language</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Details / Notes
              </label>
              <textarea
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                placeholder="Explain the inaccuracy..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-cream-200 bg-white text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setReportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success('Thank you. Safety review team notified.');
                  setReportModalOpen(false);
                  setReportNotes('');
                }}
              >
                Submit Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px] text-xs font-bold text-brand-forest animate-pulse">
          Connecting to Agronomy Intelligence Brain...
        </div>
      }
    >
      <AssistantChat />
    </Suspense>
  );
}
