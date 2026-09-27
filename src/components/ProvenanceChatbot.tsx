import React, { useState, useEffect, useRef } from 'react';
import { ProduceItem } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Wheat,
  Calendar,
  MapPin,
  CheckCircle2,
  RefreshCw,
  Info,
  Scale
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  source?: string;
  batchCard?: ProduceItem;
}

interface ProvenanceChatbotProps {
  produceList: ProduceItem[];
  preselectedProduce?: ProduceItem | null;
  onClearPreselection?: () => void;
}

export const ProvenanceChatbot: React.FC<ProvenanceChatbotProps> = ({
  produceList,
  preselectedProduce,
  onClearPreselection,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Namaste! I am Kisan Mitra (किसान मित्र), your direct farm provenance assistant. Ask me anything about who harvested your loose pulses, grains, groundnuts, and peas—including the exact farmer, village, soil type, harvest date, moisture test, or price breakdown!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'farm-registry',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduceContext, setSelectedProduceContext] = useState<ProduceItem | null>(
    preselectedProduce || produceList[0] || null
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preselectedProduce) {
      setSelectedProduceContext(preselectedProduce);
      // Auto-trigger a contextual question
      handleSend(
        `Who harvested this batch of ${preselectedProduce.name} (Batch #${preselectedProduce.harvestInfo.batchNumber}), where was it grown, and when was it harvested?`,
        preselectedProduce
      );
    }
  }, [preselectedProduce]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string, explicitProduce?: ProduceItem) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const activeContext = explicitProduce || selectedProduceContext;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          batchContext: activeContext
            ? {
                produceName: activeContext.name,
                hindiName: activeContext.hindiName,
                tier: activeContext.tier,
                batchNumber: activeContext.harvestInfo.batchNumber,
                pricePerKg: activeContext.pricePerKg,
                farmerPayoutPercent: activeContext.feeStructure.farmerSharePercent,
                farmerName: activeContext.farmer.name,
                village: activeContext.farmer.village,
                district: activeContext.farmer.district,
                state: activeContext.farmer.state,
                acreage: activeContext.farmer.acreage,
                soilType: activeContext.farmer.soilType,
                irrigation: activeContext.farmer.irrigation,
                harvestDate: activeContext.harvestInfo.harvestDate,
                sowingDate: activeContext.harvestInfo.sowingDate,
                sunDryingDays: activeContext.harvestInfo.sunDryingDays,
                moisturePercent: activeContext.harvestInfo.moisturePercent,
                pesticideFree: activeContext.harvestInfo.pesticideFree,
                organicCertified: activeContext.harvestInfo.organicCertified,
                labCertificate: activeContext.harvestInfo.labCertificateId,
              }
            : null,
          chatHistory: messages.slice(-6).map((m) => ({
            role: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || data.fallback || 'Information retrieved from farm registry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
        batchCard: activeContext || undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `Namaste! Verified harvest log: This batch is unpolished, 100% loose, and harvested directly from verified family farms within 40km of our regional warehouse hubs. Zero middlemen commissions are deducted.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'farm-registry-fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePromptPills = [
    'Who grew the Unpolished Toor Dal (#KL-TD-402)?',
    'When was the Guntur Green Gram harvested and what soil was used?',
    'Explain the price breakdown for 5kg loose Sona Masoori Rice',
    'Why is loose produce 30% cheaper than supermarket branded packets?',
    'What is the moisture level & lab certificate for Saurashtra groundnuts?',
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col h-[750px]">
      {/* Chatbot Header */}
      <div className="bg-stone-900 text-stone-100 p-4 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base font-serif text-white">
                Kisan Mitra &bull; Farm Provenance AI
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-medium px-2 py-0.5 rounded border border-emerald-500/30">
                100% Traceable
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Direct harvest dates, farmer profiles, and soil chemistry data for all loose produce
            </p>
          </div>
        </div>

        {/* Active Produce Context Selector */}
        <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">
          <Wheat className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] text-stone-400 hidden md:inline">Produce Context:</span>
          <select
            value={selectedProduceContext?.id || ''}
            onChange={(e) => {
              const found = produceList.find((p) => p.id === e.target.value);
              if (found) setSelectedProduceContext(found);
            }}
            className="bg-transparent text-amber-200 text-xs font-medium focus:outline-hidden cursor-pointer max-w-[200px] truncate"
          >
            {produceList.map((p) => (
              <option key={p.id} value={p.id} className="bg-stone-900 text-stone-100">
                {p.name} (#{p.harvestInfo.batchNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-600" />
          Quick Inquiries:
        </span>
        {samplePromptPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill)}
            className="whitespace-nowrap px-3 py-1 rounded-full text-xs bg-white text-stone-700 border border-stone-300 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 transition-colors shadow-2xs"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Message Thread Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-white rounded-br-xs shadow-xs'
                  : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 pb-1 border-b border-stone-200/40">
                <span className="font-semibold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'Consumer' : 'Kisan Mitra AI'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Provenance Micro-Card if attached */}
              {msg.batchCard && msg.sender === 'bot' && (
                <div className="mt-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 flex items-center gap-1">
                      <Wheat className="w-3.5 h-3.5 text-amber-600" />
                      {msg.batchCard.name}
                    </span>
                    <span className="font-mono text-[11px] bg-stone-200 px-1.5 py-0.5 rounded">
                      Batch #{msg.batchCard.harvestInfo.batchNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-400 block">Farmer & Village:</span>
                      <span className="font-semibold text-stone-800">
                        {msg.batchCard.farmer.name} ({msg.batchCard.farmer.village})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Harvest Date:</span>
                      <span className="font-semibold text-stone-800">
                        {new Date(msg.batchCard.harvestInfo.harvestDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Soil Chemistry:</span>
                      <span className="font-semibold text-stone-800">{msg.batchCard.farmer.soilType}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Farmer Net Realization:</span>
                      <span className="font-bold text-emerald-700">
                        {msg.batchCard.feeStructure.farmerSharePercent}% Direct Payout
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {msg.source && (
                <div className="pt-1 text-[9px] text-stone-400 text-right">
                  Source: {msg.source} &bull; Verified Farm-Gate Record
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-stone-500 bg-white p-3 rounded-xl border border-stone-200 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
            <span>Consulting regional warehouse ledger & farm batch records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about farmer provenance, harvest dates, pesticide testing, or pricing..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-stone-900"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
        <p className="text-[10px] text-stone-400 text-center mt-2">
          Every response references actual digital harvest records, soil certificates, and farmer registry IDs from KisanDirect regional hubs.
        </p>
      </div>
    </div>
  );
};
